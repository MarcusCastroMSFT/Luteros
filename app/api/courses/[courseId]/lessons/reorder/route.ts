import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrInstructor } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { courses, lessons } from '@/lib/db/schema'
import { asc, eq, inArray, sql } from 'drizzle-orm'

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

    // Two-phase reorder to avoid the (courseId, order) unique-index conflict,
    // but each phase is a single batched CASE WHEN update instead of N queries.
    await db.transaction(async (tx) => {
      const tempCases = sql.join(
        lessonIds.map((id: string, i: number) => sql`WHEN ${id}::uuid THEN ${-(i + 1)}`),
        sql` `,
      )
      await tx.update(lessons)
        .set({ order: sql`CASE ${lessons.id} ${tempCases} END` })
        .where(inArray(lessons.id, lessonIds))

      const finalCases = sql.join(
        lessonIds.map((id: string, i: number) => sql`WHEN ${id}::uuid THEN ${i}`),
        sql` `,
      )
      await tx.update(lessons)
        .set({ order: sql`CASE ${lessons.id} ${finalCases} END` })
        .where(inArray(lessons.id, lessonIds))
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
