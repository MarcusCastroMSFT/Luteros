import { NextRequest, NextResponse, connection } from 'next/server'
import { revalidatePath, revalidateTag } from '@/lib/cache'
import { requireAdminOrInstructor } from '@/lib/auth-helpers'
import { and, asc, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { db } from '@/lib/db'
import { courses, lessons, users } from '@/lib/db/schema'
import { submitToIndexNow } from '@/lib/indexnow'

export async function GET(request: NextRequest) {
  await connection()

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const pageSize = parseInt(searchParams.get('pageSize') || searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    
    // Extract sorting parameters
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    // Verify authentication and authorization (admin or instructor only)
    const authResult = await requireAdminOrInstructor(request)
    if (authResult instanceof NextResponse) {
      return authResult // Return 401/403 response
    }

    const instructor = alias(users, 'instructor')

    const searchWhere = search ? or(
      ilike(courses.title, `%${search}%`),
      ilike(courses.description, `%${search}%`),
      ilike(courses.category, `%${search}%`),
      ilike(instructor.name, `%${search}%`),
    ) : undefined

    const statusWhere = status.toLowerCase() === 'ativo' ? eq(courses.isPublished, true)
      : status.toLowerCase() === 'rascunho' ? eq(courses.isPublished, false)
      : undefined

    const where = searchWhere && statusWhere ? sql`${searchWhere} AND ${statusWhere}`
      : searchWhere || statusWhere || undefined

    const sortColMap: Record<string, unknown> = {
      title: courses.title,
      category: courses.category,
      level: courses.level,
      rating: courses.averageRating,
      studentsCount: courses.enrollmentCount,
      price: courses.price,
      createdAt: courses.createdAt,
      instructor: instructor.name,
    }
    const sortCol = (sortColMap[sortBy] ?? courses.createdAt) as Parameters<typeof asc>[0]
    const orderFn = sortOrder === 'asc' ? asc : desc

    const [[{ totalCount }], coursesRows] = await Promise.all([
      db.select({ totalCount: sql<number>`count(*)::int` }).from(courses)
        .innerJoin(instructor, eq(courses.instructorId, instructor.id)).where(where),
      db.select({
        id: courses.id, title: courses.title, slug: courses.slug,
        description: courses.description, shortDescription: courses.shortDescription,
        thumbnail: courses.thumbnail, category: courses.category, level: courses.level,
        duration: courses.duration, price: courses.price, discountPrice: courses.discountPrice,
        isFree: courses.isFree, isPublished: courses.isPublished, publishedAt: courses.publishedAt,
        enrollmentCount: courses.enrollmentCount, averageRating: courses.averageRating,
        reviewCount: courses.reviewCount, createdAt: courses.createdAt, updatedAt: courses.updatedAt,
        instructorId: instructor.id, instructorName: instructor.name,
        instructorDisplayName: instructor.displayName, instructorAvatar: instructor.image,
      }).from(courses).innerJoin(instructor, eq(courses.instructorId, instructor.id))
        .where(where).orderBy(orderFn(sortCol)).offset(page * pageSize).limit(pageSize),
    ])

    // Batch lesson counts for all courses on this page in one query
    const courseIds = coursesRows.map((c) => c.id)
    const lessonCounts = courseIds.length > 0
      ? await db
          .select({ courseId: lessons.courseId, count: sql<number>`count(*)::int` })
          .from(lessons)
          .where(and(inArray(lessons.courseId, courseIds), eq(lessons.isPublished, true)))
          .groupBy(lessons.courseId)
      : []
    const lessonCountMap = new Map(lessonCounts.map((c) => [c.courseId, c.count]))

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
      'BEGINNER': 'Iniciante',
      'INTERMEDIATE': 'IntermediÃ¡rio',
      'ADVANCED': 'AvanÃ§ado',
    }

    const transformedCourses = coursesRows.map((course) => {
      const price = course.price ? parseFloat(course.price.toString()) : 0
      const discountPrice = course.discountPrice ? parseFloat(course.discountPrice.toString()) : null
      const rating = course.averageRating ? parseFloat(course.averageRating.toString()) : 0

      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        instructor: course.instructorName || course.instructorDisplayName || 'Unknown',
        instructorId: course.instructorId,
        instructorTitle: '',
        category: course.category,
        level: levelDisplayMap[course.level] || course.level,
        studentsCount: course.enrollmentCount,
        rating,
        reviewsCount: course.reviewCount,
        price: discountPrice !== null ? discountPrice : price,
        originalPrice: discountPrice !== null ? price : undefined,
        lessonsCount: lessonCountMap.get(course.id) ?? 0,
        duration: formatDuration(course.duration),
        status: course.isPublished ? 'Ativo' : 'Rascunho',
        isBestSeller: course.enrollmentCount > 1000,
        lastUpdated: course.updatedAt.toISOString(),
      }
    })

    const pageCount = Math.ceil(totalCount / pageSize)

    return NextResponse.json({
      data: transformedCourses,
      totalCount,
      pageCount,
      page,
      pageSize,
    })
  } catch (error) {
    console.error('Courses API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication and authorization (admin or instructor only)
    const authResult = await requireAdminOrInstructor(request)
    if (authResult instanceof NextResponse) {
      return authResult // Return 401/403 response
    }

    // Parse request body
    const body = await request.json()
    const { 
      title, 
      slug, 
      description, 
      shortDescription,
      level,
      category,
      language = 'pt-BR',
      duration,
      thumbnail,
      coverImage,
      previewVideo,
      price,
      discountPrice,
      isFree = false,
      isPublished = false,
      instructorId,
    } = body

    // Validation
    if (!title || !slug || !description || !level || !category) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatÃ³rios faltando' },
        { status: 400 }
      )
    }

    // Valid levels
    const validLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'Iniciante', 'IntermediÃ¡rio', 'AvanÃ§ado']
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { success: false, error: 'NÃ­vel invÃ¡lido' },
        { status: 400 }
      )
    }

    // Map Portuguese levels to database format
    const levelMap: Record<string, string> = {
      'Iniciante': 'BEGINNER',
      'IntermediÃ¡rio': 'INTERMEDIATE', 
      'AvanÃ§ado': 'ADVANCED',
    }
    const dbLevel = levelMap[level] || level

    // Use provided instructorId or default to the authenticated user
    const finalInstructorId = instructorId || authResult.user.id

    // Check if slug already exists
    const existingCourse = await db.select({ id: courses.id }).from(courses).where(eq(courses.slug, slug)).limit(1).then((r) => r[0] ?? null)

    if (existingCourse) {
      return NextResponse.json(
        { success: false, error: 'JÃ¡ existe um curso com esse slug' },
        { status: 400 }
      )
    }

    // Create course
    const [course] = await db.insert(courses).values({
        title,
        slug,
        description,
        shortDescription: shortDescription || null,
        level: dbLevel,
        category,
        language,
        duration: duration ? parseInt(duration) : null,
        thumbnail: thumbnail || null,
        coverImage: coverImage || null,
        previewVideo: previewVideo || null,
        price: price ? String(parseFloat(price)) : null,
        discountPrice: discountPrice ? String(parseFloat(discountPrice)) : null,
        isFree,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
        instructorId: finalInstructorId,
        enrollmentCount: 0,
        reviewCount: 0,
      }).returning()

    // Invalidate cache so users see the new course immediately
    revalidatePath('/courses')
    revalidatePath(`/courses/${slug}`)
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

    return NextResponse.json({
      success: true,
      data: course,
    })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao criar curso' },
      { status: 500 }
    )
  }
}
