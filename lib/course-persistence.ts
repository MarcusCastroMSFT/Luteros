import { eq } from 'drizzle-orm'
import type { db } from './db'
import { courseInstructors, courses } from './db/schema'

type CourseDatabase = typeof db
type NewCourse = typeof courses.$inferInsert

export async function createCourseWithInstructors(
  database: CourseDatabase,
  course: NewCourse & { id: string },
  instructorIds: string[],
) {
  const [createdCourses] = await database.batch([
    database.insert(courses).values(course).returning(),
    database.insert(courseInstructors).values(
      instructorIds.map((instructorId, order) => ({
        courseId: course.id,
        instructorId,
        order,
      })),
    ),
  ])
  return createdCourses
}

export async function updateCourseWithInstructors(
  database: CourseDatabase,
  courseId: string,
  changes: Partial<NewCourse>,
  instructorIds: string[] | null,
) {
  const update = database.update(courses).set(changes).where(eq(courses.id, courseId)).returning()
  // Neon HTTP batches run atomically; interactive transaction callbacks are unsupported.
  const [updatedCourses] = instructorIds === null
    ? await database.batch([update])
    : await database.batch([
        update,
        database.delete(courseInstructors).where(eq(courseInstructors.courseId, courseId)),
        database.insert(courseInstructors).values(
          instructorIds.map((instructorId, order) => ({
            courseId,
            instructorId,
            order,
          })),
        ),
      ])
  return updatedCourses
}
