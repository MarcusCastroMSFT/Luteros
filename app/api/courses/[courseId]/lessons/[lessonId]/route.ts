import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from '@/lib/cache'
import { requireAdminOrInstructor } from '@/lib/auth-helpers'
import { requireCourseManager } from '@/lib/course-access'
import { db } from '@/lib/db'
import { courses, lessons } from '@/lib/db/schema'
import { and, asc, eq, inArray, sql } from 'drizzle-orm'
import {
  collectCourseMediaReferences,
  CourseMediaDeletionError,
  deleteCourseMediaReferences,
  deleteCourseMediaReferencesStrict,
} from '@/lib/course-media-cleanup.server'
import { getCourseMediaStorage } from '@/lib/course-media-storage.server'

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

    const courseOwner = await db.select({ instructorId: courses.instructorId })
      .from(courses).where(eq(courses.id, courseId)).limit(1).then((r) => r[0] ?? null)
    if (!courseOwner) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
    }
    const forbidden = requireCourseManager(authResult.user, courseOwner.instructorId)
    if (forbidden) return forbidden

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

    const nextVideoUrl = videoUrl !== undefined ? videoUrl?.trim() || null : existingLesson.videoUrl
    const nextVideoProvider = videoProvider !== undefined ? videoProvider || null : existingLesson.videoProvider
    const videoWasReplaced = nextVideoUrl !== existingLesson.videoUrl
      || nextVideoProvider !== existingLesson.videoProvider
    const replacedMedia = collectCourseMediaReferences({
      courseId,
      blobEndpoint: process.env.AZURE_STORAGE_BLOB_ENDPOINT || '',
      lessons: videoWasReplaced ? [existingLesson] : [],
    })
    const [lesson] = await deleteCourseMediaReferences({
      courseId,
      references: replacedMedia,
      getStorage: getCourseMediaStorage,
      mutate: () => db.update(lessons).set(updateData).where(eq(lessons.id, lessonId)).returning(),
    })

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

    const existingLesson = await db.select({
      id: lessons.id,
      order: lessons.order,
      videoUrl: lessons.videoUrl,
      videoProvider: lessons.videoProvider,
    }).from(lessons)
      .where(and(eq(lessons.id, lessonId), eq(lessons.courseId, courseId)))
      .limit(1).then((r) => r[0] ?? null)

    if (!existingLesson) {
      return NextResponse.json({ success: false, error: 'Lesson not found' }, { status: 404 })
    }

    const courseOwner = await db.select({ instructorId: courses.instructorId })
      .from(courses).where(eq(courses.id, courseId)).limit(1).then((r) => r[0] ?? null)
    if (!courseOwner) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
    }
    const forbidden = requireCourseManager(authResult.user, courseOwner.instructorId)
    if (forbidden) return forbidden

    const mediaToDelete = collectCourseMediaReferences({
      courseId,
      blobEndpoint: process.env.AZURE_STORAGE_BLOB_ENDPOINT || '',
      lessons: [existingLesson],
    })

    await deleteCourseMediaReferencesStrict({
      courseId,
      references: mediaToDelete,
      getStorage: getCourseMediaStorage,
      mutate: async () => {
        await db.delete(lessons).where(eq(lessons.id, lessonId))

        // Reorder remaining lessons to close the gap. Two-phase batched update
        // avoids the (courseId, order) unique-index conflict without N round-trips.
        const remaining = await db.select({ id: lessons.id }).from(lessons)
          .where(eq(lessons.courseId, courseId)).orderBy(asc(lessons.order))

        if (remaining.length > 0) {
          const remainingIds = remaining.map((r) => r.id)
          await db.transaction(async (tx) => {
            const tempCases = sql.join(
              remainingIds.map((id, i) => sql`WHEN ${id}::uuid THEN ${-(i + 1)}`),
              sql` `,
            )
            await tx.update(lessons)
              .set({ order: sql`CASE ${lessons.id} ${tempCases} END` })
              .where(inArray(lessons.id, remainingIds))

            const finalCases = sql.join(
              remainingIds.map((id, i) => sql`WHEN ${id}::uuid THEN ${i}`),
              sql` `,
            )
            await tx.update(lessons)
              .set({ order: sql`CASE ${lessons.id} ${finalCases} END` })
              .where(inArray(lessons.id, remainingIds))
          })
        }
      },
    })

    const course = await db.select({ slug: courses.slug }).from(courses).where(eq(courses.id, courseId)).limit(1).then((r) => r[0] ?? null)
    if (course?.slug) revalidateTag(`course-${course.slug}`)
    revalidateTag('courses')
    revalidateTag('courses-initial')

    return NextResponse.json({ success: true, message: 'Lesson deleted successfully' })
  } catch (error) {
    if (error instanceof CourseMediaDeletionError) {
      console.warn('Lesson video deletion failed; lesson was preserved')
      return NextResponse.json({
        success: false,
        error: 'Não foi possível excluir o vídeo. A aula foi mantida; tente novamente.',
      }, { status: 503 })
    }
    console.error('Error deleting lesson:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
