import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrInstructor } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { courses, lessons } from '@/lib/db/schema'
import { asc, eq, inArray } from 'drizzle-orm'

// PUT reorder lessons
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const authResult = await requireAdminOrInstructor(request)
    if (authResult instanceof NextResponse) return authResult

    const { courseId } = await context.params

    const course = await db.select({ id: courses.id }).from(courses).where(eq(courses.id, courseId)).limit(1).then((r) => r[0] ?? null)
    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
    }

    const body = await request.json()
    const { lessonIds } = body

    if (!Array.isArray(lessonIds)) {
      return NextResponse.json({ success: false, error: 'lessonIds must be an array' }, { status: 400 })
    }

    const existing = await db.select({ id: lessons.id }).from(lessons)
      .where(inArray(lessons.id, lessonIds))

    if (existing.length !== lessonIds.length) {
      return NextResponse.json({ success: false, error: 'Some lessons were not found or do not belong to this course' }, { status: 400 })
    }

    // Step 1: Set negative temps, Step 2: Set final to avoid unique constraint conflicts
    await db.transaction(async (tx) => {
      for (let i = 0; i < lessonIds.length; i++) {
        await tx.update(lessons).set({ order: -(i + 1) }).where(eq(lessons.id, lessonIds[i]))
      }
      for (let i = 0; i < lessonIds.length; i++) {
        await tx.update(lessons).set({ order: i }).where(eq(lessons.id, lessonIds[i]))
      }
    })

    const updatedLessons = await db
      .select({
        id: lessons.id, title: lessons.title, type: lessons.type,
        description: lessons.description, duration: lessons.duration,
        order: lessons.order, sectionTitle: lessons.sectionTitle,
        isPublished: lessons.isPublished, isFree: lessons.isFree,
      })
      .from(lessons)
      .where(eq(lessons.courseId, courseId))
      .orderBy(asc(lessons.order))

    return NextResponse.json({ success: true, data: updatedLessons })
  } catch (error) {
    console.error('Error reordering lessons:', error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 })
  }
}
