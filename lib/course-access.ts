import { NextResponse } from 'next/server'
import type { AuthUser } from './auth-helpers'

type CourseInstructorIds = string | readonly string[]

export function canManageCourse(user: AuthUser, instructorIds: CourseInstructorIds): boolean {
  const assignedInstructorIds = typeof instructorIds === 'string'
    ? [instructorIds]
    : instructorIds

  return user.role === 'ADMIN'
    || (user.role === 'INSTRUCTOR' && assignedInstructorIds.includes(user.id))
}

export type StaffAccess = 'ADMIN' | 'INSTRUCTOR' | null

/**
 * Staff enter courses without paying: admins in every course, instructors only in the
 * courses they teach. Same rule as canManageCourse, but says which role granted it
 * so the UI can explain the access.
 */
export function getStaffAccess(user: AuthUser, instructorIds: CourseInstructorIds): StaffAccess {
  if (!canManageCourse(user, instructorIds)) return null
  return user.role === 'ADMIN' ? 'ADMIN' : 'INSTRUCTOR'
}

export function requireCourseManager(
  user: AuthUser,
  instructorIds: CourseInstructorIds,
): NextResponse | null {
  if (canManageCourse(user, instructorIds)) return null

  return NextResponse.json(
    {
      success: false,
      error: 'Forbidden: You cannot manage this course',
    },
    { status: 403 },
  )
}