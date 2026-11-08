export interface InstructorCourseLink {
  instructorId: string
  courseId: string
}

/**
 * Counts distinct courses per instructor. The same course can appear twice for one
 * instructor (as a listed instructor and as the course owner), so duplicates are ignored.
 */
export function countCoursesPerInstructor(links: InstructorCourseLink[]): Map<string, number> {
  const courseIdsByInstructor = new Map<string, Set<string>>()
  for (const { instructorId, courseId } of links) {
    const ids = courseIdsByInstructor.get(instructorId) ?? new Set<string>()
    ids.add(courseId)
    courseIdsByInstructor.set(instructorId, ids)
  }
  return new Map([...courseIdsByInstructor].map(([instructorId, ids]) => [instructorId, ids.size]))
}
