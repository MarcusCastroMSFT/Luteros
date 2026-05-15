import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from '@/lib/cache'
import { requireAdminOrInstructor } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { courses, lessons } from '@/lib/db/schema'
import { and, asc, eq } from 'drizzle-orm'

// GET a single lesson
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const authResult = await requireAdminOrInstructor(request)
    if (authResult instanceof NextResponse) return authResult

    const { courseId, lessonId } = await context.params

    const lesson = await db.select().from(lessons)
      .where(and(eq(lessons.id, lessonId), eq(lessons.courseId, courseId)))
      .limit(1).then((r) => r[0] ?? null)

    if (!lesson) {
      return NextResponse.json({ success: false, error: 'Lesson not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: lesson })
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// PUT update a lesson
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const authResult = await requireAdminOrInstructor(request)
    if (authResult instanceof NextResponse) return authResult

    const { courseId, lessonId } = await context.params

    const existingLesson = await db.select().from(lessons)
      .where(and(eq(lessons.id, lessonId), eq(lessons.courseId, courseId)))
      .limit(1).then((r) => r[0] ?? null)

    if (!existingLesson) {
      return NextResponse.json({ success: false, error: 'Lesson not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, type, description, content, videoUrl, videoProvider, duration, sectionTitle, isPublished, isFree } = body

    if (title !== undefined && !title?.trim()) {
      return NextResponse.json({ success: false, error: 'Title cannot be empty' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title.trim()
    if (type !== undefined) updateData.type = type
    if (description !== undefined) updateData.description = description?.trim() || null
    if (content !== undefined) updateData.content = content || null
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl?.trim() || null
    if (videoProvider !== undefined) updateData.videoProvider = videoProvider || null
    if (duration !== undefined) updateData.duration = duration ? parseInt(duration) : null
    if (sectionTitle !== undefined) updateData.sectionTitle = sectionTitle?.trim() || null
    if (isPublished !== undefined) updateData.isPublished = isPublished
    if (isFree !== undefined) updateData.isFree = isFree

    const [lesson] = await db.update(lessons).set(updateData).where(eq(lessons.id, lessonId)).returning()

    const course = await db.select({ slug: courses.slug }).from(courses).where(eq(courses.id, courseId)).limit(1).then((r) => r[0] ?? null)
    if (course?.slug) revalidateTag(`course-${course.slug}`)
    revalidateTag('courses')
    revalidateTag('courses-initial')

    return NextResponse.json({ success: true, data: lesson })
  } catch (error) {
    console.error('Error updating lesson:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE a lesson
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const authResult = await requireAdminOrInstructor(request)
    if (authResult instanceof NextResponse) return authResult

    const { courseId, lessonId } = await context.params

    const existingLesson = await db.select({ id: lessons.id, order: lessons.order }).from(lessons)
      .where(and(eq(lessons.id, lessonId), eq(lessons.courseId, courseId)))
      .limit(1).then((r) => r[0] ?? null)

    if (!existingLesson) {
      return NextResponse.json({ success: false, error: 'Lesson not found' }, { status: 404 })
    }

    await db.delete(lessons).where(eq(lessons.id, lessonId))

    // Reorder remaining lessons
    const remaining = await db.select({ id: lessons.id }).from(lessons)
      .where(eq(lessons.courseId, courseId)).orderBy(asc(lessons.order))

    await db.transaction(async (tx) => {
      for (let i = 0; i < remaining.length; i++) {
        await tx.update(lessons).set({ order: i }).where(eq(lessons.id, remaining[i].id))
      }
    })

    const course = await db.select({ slug: courses.slug }).from(courses).where(eq(courses.id, courseId)).limit(1).then((r) => r[0] ?? null)
    if (course?.slug) revalidateTag(`course-${course.slug}`)
    revalidateTag('courses')
    revalidateTag('courses-initial')

    return NextResponse.json({ success: true, message: 'Lesson deleted successfully' })
  } catch (error) {
    console.error('Error deleting lesson:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
