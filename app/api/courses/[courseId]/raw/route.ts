import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrInstructor } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { courses, lessons, users } from '@/lib/db/schema'
import { asc, eq } from 'drizzle-orm'

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
      .select()
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

    const instructor = await db
      .select({ id: users.id, name: users.name, displayName: users.displayName, image: users.image })
      .from(users)
      .where(eq(users.id, course.instructorId))
      .limit(1)
      .then((r) => r[0] ?? null)

    const courseLessons = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        description: lessons.description,
        duration: lessons.duration,
        order: lessons.order,
        sectionTitle: lessons.sectionTitle,
        isPublished: lessons.isPublished,
        isFree: lessons.isFree,
      })
      .from(lessons)
      .where(eq(lessons.courseId, courseId))
      .orderBy(asc(lessons.order))

    const rawCourse = {
      ...course,
      price: course.price ? parseFloat(course.price.toString()) : null,
      discountPrice: course.discountPrice ? parseFloat(course.discountPrice.toString()) : null,
      averageRating: course.averageRating ? parseFloat(course.averageRating.toString()) : null,
      user_profiles: instructor,
      lessons: courseLessons,
    }

    return NextResponse.json({
      success: true,
      data: rawCourse,
    })
  } catch (error) {
    console.error('Error fetching raw course:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
