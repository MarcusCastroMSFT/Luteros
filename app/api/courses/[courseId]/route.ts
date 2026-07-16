import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from '@/lib/cache'
import { requireAdminOrInstructor } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { courses, users } from '@/lib/db/schema'
import { submitToIndexNow } from '@/lib/indexnow'
import { alias } from 'drizzle-orm/pg-core'
import { eq, sql } from 'drizzle-orm'

// Format duration from minutes to readable string
const formatDuration = (minutes: number | null): string => {
  if (!minutes) return '0h'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}min`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

// Map level from database format to Portuguese
const levelDisplayMap: Record<string, string> = {
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const authResult = await requireAdminOrInstructor(request)
    if (authResult instanceof NextResponse) return authResult

    const { courseId } = await context.params
    const instructor = alias(users, 'instructor')

    const row = await db
      .select({
        id: courses.id, slug: courses.slug, title: courses.title,
        description: courses.description, shortDescription: courses.shortDescription,
        thumbnail: courses.thumbnail, coverImage: courses.coverImage, previewVideo: courses.previewVideo,
        category: courses.category, level: courses.level, language: courses.language,
        duration: courses.duration, price: courses.price, discountPrice: courses.discountPrice,
        isFree: courses.isFree, isPublished: courses.isPublished, publishedAt: courses.publishedAt,
        enrollmentCount: courses.enrollmentCount, averageRating: courses.averageRating,
        reviewCount: courses.reviewCount, createdAt: courses.createdAt, updatedAt: courses.updatedAt,
        instructorId: instructor.id, instructorName: instructor.name,
        instructorDisplayName: instructor.displayName, instructorAvatar: instructor.image,
        lessonsCount: sql<number>`(SELECT COUNT(*)::int FROM "lessons" l WHERE l."courseId" = ${courses.id})`,
      })
      .from(courses)
      .innerJoin(instructor, eq(courses.instructorId, instructor.id))
      .where(eq(courses.id, courseId))
      .limit(1)
      .then((r) => r[0] ?? null)

    if (!row) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
    }

    const price = row.price ? parseFloat(row.price.toString()) : 0
    const discountPrice = row.discountPrice ? parseFloat(row.discountPrice.toString()) : null
    const rating = row.averageRating ? parseFloat(row.averageRating.toString()) : 0

    return NextResponse.json({
      success: true,
      data: {
        id: row.id, slug: row.slug, title: row.title, description: row.description,
        shortDescription: row.shortDescription || '', thumbnail: row.thumbnail || '',
        coverImage: row.coverImage || '', previewVideo: row.previewVideo || '',
        category: row.category, level: levelDisplayMap[row.level] || row.level,
        language: row.language, duration: row.duration,
        durationFormatted: formatDuration(row.duration), price, discountPrice,
        isFree: row.isFree, isPublished: row.isPublished,
        publishedAt: row.publishedAt?.toISOString() || null,
        enrollmentCount: row.enrollmentCount, rating, reviewCount: row.reviewCount,
        lessonsCount: row.lessonsCount,
        instructor: {
          id: row.instructorId,
          name: row.instructorName || row.instructorDisplayName || 'Unknown',
          avatar: row.instructorAvatar || '/images/default-avatar.svg',
        },
        createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const authResult = await requireAdminOrInstructor(request)
    if (authResult instanceof NextResponse) return authResult

    const { courseId } = await context.params
    const body = await request.json()
    const {
      title, slug, description, shortDescription, level, category, language,
      duration, thumbnail, coverImage, previewVideo, price, discountPrice,
      isFree, isPublished, instructorId,
    } = body

    if (!title || !slug || !description || !level || !category) {
      return NextResponse.json({ success: false, error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    const validLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'Iniciante', 'Intermediário', 'Avançado']
    if (!validLevels.includes(level)) {
      return NextResponse.json({ success: false, error: 'Nível inválido' }, { status: 400 })
    }

    const levelMap: Record<string, string> = {
      Iniciante: 'BEGINNER', Intermediário: 'INTERMEDIATE', Avançado: 'ADVANCED',
    }
    const dbLevel = levelMap[level] || level

    const existing = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1).then((r) => r[0] ?? null)
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Curso não encontrado' }, { status: 404 })
    }

    if (slug !== existing.slug) {
      const conflict = await db.select({ id: courses.id }).from(courses).where(eq(courses.slug, slug)).limit(1).then((r) => r[0] ?? null)
      if (conflict) {
        return NextResponse.json({ success: false, error: 'Já existe um curso com esse slug' }, { status: 400 })
      }
    }

    const [updatedCourse] = await db.update(courses).set({
      title, slug, description,
      shortDescription: shortDescription || null,
      level: dbLevel, category,
      language: language || existing.language,
      duration: duration !== undefined ? duration : existing.duration,
      thumbnail: thumbnail || null, coverImage: coverImage || null, previewVideo: previewVideo || null,
      price: price !== undefined ? (price ? String(parseFloat(price)) : null) : existing.price,
      discountPrice: discountPrice !== undefined ? (discountPrice ? String(parseFloat(discountPrice)) : null) : existing.discountPrice,
      isFree: isFree !== undefined ? isFree : existing.isFree,
      isPublished: isPublished !== undefined ? isPublished : existing.isPublished,
      publishedAt: isPublished && !existing.isPublished ? new Date() : existing.publishedAt,
      instructorId: instructorId || existing.instructorId,
    }).where(eq(courses.id, courseId)).returning()

    revalidatePath('/courses')
    revalidatePath(`/courses/${slug}`)
    if (slug !== existing.slug) {
      revalidatePath(`/courses/${existing.slug}`)
      revalidateTag(`course-${existing.slug}`)
    }
    revalidateTag('courses')
    revalidateTag('courses-initial')
    revalidateTag('course-slugs')
    revalidateTag(`course-${slug}`)
    revalidateTag('courses-stats')

    // Notify IndexNow when the course is published
    if (isPublished) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.lutteros.com.br'
      await submitToIndexNow([`${baseUrl}/courses/${slug}`, `${baseUrl}/courses`])
    }

    return NextResponse.json({ success: true, data: updatedCourse })
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar curso' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const authResult = await requireAdminOrInstructor(request)
    if (authResult instanceof NextResponse) return authResult

    const { courseId } = await context.params

    const existing = await db.select({ id: courses.id, slug: courses.slug }).from(courses).where(eq(courses.id, courseId)).limit(1).then((r) => r[0] ?? null)
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
    }

    await db.delete(courses).where(eq(courses.id, courseId))

    revalidatePath('/courses')
    revalidatePath(`/courses/${existing.slug}`)
    revalidateTag('courses')
    revalidateTag('courses-initial')
    revalidateTag('course-slugs')
    revalidateTag(`course-${existing.slug}`)
    revalidateTag('courses-stats')

    return NextResponse.json({ success: true, message: 'Course deleted successfully' })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
