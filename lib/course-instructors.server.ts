import { and, asc, eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { courseInstructors, courses, users } from '@/lib/db/schema'
import { countCoursesPerInstructor } from '@/lib/instructor-courses'

export type CourseInstructorProfile = {
  courseId: string
  id: string
  name: string | null
  displayName: string | null
  image: string | null
  bio: string | null
  order: number
}

export async function getCourseInstructorIds(
  courseId: string,
  fallbackInstructorId?: string,
): Promise<string[]> {
  const rows = await db
    .select({ instructorId: courseInstructors.instructorId })
    .from(courseInstructors)
    .where(eq(courseInstructors.courseId, courseId))
    .orderBy(asc(courseInstructors.order))

  if (rows.length > 0) return rows.map((row) => row.instructorId)
  return fallbackInstructorId ? [fallbackInstructorId] : []
}

export async function getCourseInstructorProfiles(
  courseIds: string[],
): Promise<CourseInstructorProfile[]> {
  if (courseIds.length === 0) return []

  return db
    .select({
      courseId: courseInstructors.courseId,
      id: users.id,
      name: users.name,
      displayName: users.displayName,
      image: users.image,
      bio: users.bio,
      order: courseInstructors.order,
    })
    .from(courseInstructors)
    .innerJoin(users, eq(courseInstructors.instructorId, users.id))
    .where(inArray(courseInstructors.courseId, courseIds))
    .orderBy(asc(courseInstructors.order))
}

/** Published courses taught by each instructor, as a listed instructor or as the course owner. */
export async function getPublishedCourseCounts(instructorIds: string[]): Promise<Map<string, number>> {
  const ids = [...new Set(instructorIds)]
  if (ids.length === 0) return new Map()

  const [listed, owned] = await Promise.all([
    db
      .select({ instructorId: courseInstructors.instructorId, courseId: courseInstructors.courseId })
      .from(courseInstructors)
      .innerJoin(courses, eq(courses.id, courseInstructors.courseId))
      .where(and(inArray(courseInstructors.instructorId, ids), eq(courses.isPublished, true))),
    db
      .select({ instructorId: courses.instructorId, courseId: courses.id })
      .from(courses)
      .where(and(inArray(courses.instructorId, ids), eq(courses.isPublished, true))),
  ])

  return countCoursesPerInstructor([...listed, ...owned])
}

export async function areValidCourseInstructorIds(instructorIds: string[]): Promise<boolean> {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(and(
      inArray(users.id, instructorIds),
      inArray(users.role, ['ADMIN', 'INSTRUCTOR']),
    ))

  return rows.length === instructorIds.length
}