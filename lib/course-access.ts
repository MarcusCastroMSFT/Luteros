import { NextResponse } from 'next/server'
import type { AuthUser } from './auth-helpers'

export function canManageCourse(user: AuthUser, instructorId: string): boolean {
  return user.role === 'ADMIN'
    || (user.role === 'INSTRUCTOR' && user.id === instructorId)
}

export function requireCourseManager(
  user: AuthUser,
  instructorId: string,
): NextResponse | null {
  if (canManageCourse(user, instructorId)) return null

  return NextResponse.json(
    {
      success: false,
      error: 'Forbidden: You cannot manage this course',
    },
    { status: 403 },
  )
}