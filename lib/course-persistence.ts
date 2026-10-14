import { eq, inArray, sql } from 'drizzle-orm'
import type { db } from './db'
import { courseInstructors, courses, lessons } from './db/schema'

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

// Two phases avoid the (courseId, order) unique-index conflict: temporary negative
// orders first, then the final ones, atomically in a single batch.
export async function reorderCourseLessons(database: CourseDatabase, lessonIds: string[]) {
  const setOrder = (orderFor: (index: number) => number) => {
    const cases = sql.join(
      lessonIds.map((id, index) => sql`WHEN ${id}::uuid THEN ${orderFor(index)}`),
      sql` `,
    )
    return database.update(lessons)
      .set({ order: sql`CASE ${lessons.id} ${cases} END` })
      .where(inArray(lessons.id, lessonIds))
  }

  await database.batch([setOrder((index) => -(index + 1)), setOrder((index) => index)])
}
