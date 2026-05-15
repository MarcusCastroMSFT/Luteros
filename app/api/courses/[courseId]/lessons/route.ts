import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from '@/lib/cache'
import { requireAdminOrInstructor } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { courses, lessons } from '@/lib/db/schema'
import { asc, eq, sql } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const authResult = await requireAdminOrInstructor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const params = await context.params
    const courseId = params.courseId

    const course = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1)
      .then((r) => r[0] ?? null)

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    const courseLessons = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        type: lessons.type,
        description: lessons.description,
        content: lessons.content,
        videoUrl: lessons.videoUrl,
        videoProvider: lessons.videoProvider,
        duration: lessons.duration,
        order: lessons.order,
        sectionTitle: lessons.sectionTitle,
        isPublished: lessons.isPublished,
        isFree: lessons.isFree,
        createdAt: lessons.createdAt,
        updatedAt: lessons.updatedAt,
      })
      .from(lessons)
      .where(eq(lessons.courseId, courseId))
      .orderBy(asc(lessons.order))

    return NextResponse.json({
      success: true,
      data: courseLessons,
    })
  } catch (error) {
    console.error('Error fetching lessons:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const authResult = await requireAdminOrInstructor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const params = await context.params
    const courseId = params.courseId

    const course = await db
      .select({ id: courses.id, slug: courses.slug })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1)
      .then((r) => r[0] ?? null)

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      title,
      type = 'video',
      description,
      content,
      videoUrl,
      videoProvider,
      duration,
      sectionTitle,
      isPublished = false,
      isFree = false,
    } = body

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      )
    }

    const [{ maxOrder }] = await db
      .select({ maxOrder: sql<number>`coalesce(max(${lessons.order}), -1)::int` })
      .from(lessons)
      .where(eq(lessons.courseId, courseId))

    const nextOrder = maxOrder + 1

    const [lesson] = await db
      .insert(lessons)
      .values({
        courseId,
        title: title.trim(),
        type,
        description: description?.trim() || null,
        content: content || null,
        videoUrl: videoUrl?.trim() || null,
        videoProvider: videoProvider || null,
        duration: duration ? parseInt(duration) : null,
        sectionTitle: sectionTitle?.trim() || null,
        order: nextOrder,
        isPublished,
        isFree,
      })
      .returning()

    if (course.slug) {
      revalidateTag(`course-${course.slug}`)
    }
    revalidateTag('courses')
    revalidateTag('courses-initial')

    return NextResponse.json({
      success: true,
      data: lesson,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

