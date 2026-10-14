export function normalizeCourseInstructorIds(
  instructorIds: unknown,
  fallbackInstructorId: string,
): string[] {
  const candidates = Array.isArray(instructorIds) ? instructorIds : []
  const normalized = candidates
    .filter((instructorId): instructorId is string => typeof instructorId === 'string')
    .map((instructorId) => instructorId.trim())
    .filter(Boolean)

  return normalized.length > 0
    ? [...new Set(normalized)]
    : [fallbackInstructorId]
}

export function resolveCourseInstructorIdsForActor(
  instructorIds: unknown,
  actorId: string,
  canAssignInstructors: boolean,
): string[] {
  return canAssignInstructors
    ? normalizeCourseInstructorIds(instructorIds, actorId)
    : [actorId]
}

export function replaceCoursePrimaryInstructor(
  instructorIds: string[],
  primaryInstructorId: string,
): string[] {
  return [
    primaryInstructorId,
    ...instructorIds.slice(1).filter((id) => id !== primaryInstructorId),
  ]
}