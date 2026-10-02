import { and, asc, eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { courseInstructors, users } from '@/lib/db/schema'

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