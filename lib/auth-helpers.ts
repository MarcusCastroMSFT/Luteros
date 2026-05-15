import { cache } from 'react'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'USER' | 'PROFESSIONAL'

export interface AuthUser {
  id: string
  email: string | null | undefined
  name: string | null | undefined
  image: string | null | undefined
  role: UserRole
  displayName: string | null | undefined
}

// Memoized per request: multiple helpers in the same request share one auth() call.
export const getAuthUser = cache(async (_request?: NextRequest): Promise<AuthUser | null> => {
  const session = await auth()
  if (!session?.user?.id) return null
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    role: (session.user.role as UserRole) ?? 'USER',
    displayName: session.user.displayName,
  }
})

/**
 * Require authentication for API routes.
 * Returns the user if authenticated, or a 401 response.
 */
export async function requireAuth(
  request?: NextRequest
): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return user
}

/**
 * Get the user's role from the JWT session (no DB call).
 */
export async function getUserRole(
  request?: NextRequest,
  _userId?: string
): Promise<UserRole> {
  const user = await getAuthUser(request)
  return user?.role ?? 'USER'
}

/**
 * Require specific roles for API routes.
 * Returns the user if authenticated AND has an allowed role, or an error response.
 */
export async function requireRole(
  request?: NextRequest,
  allowedRoles?: UserRole[]
): Promise<{ user: AuthUser; role: UserRole } | NextResponse> {
  const user = await getAuthUser(request)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!allowedRoles || !allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Forbidden: Insufficient permissions' },
      { status: 403 }
    )
  }

  return { user, role: user.role }
}

/**
 * Require admin or instructor role.
 */
export async function requireAdminOrInstructor(
  request?: NextRequest
): Promise<{ user: AuthUser; role: UserRole } | NextResponse> {
  return requireRole(request, ['ADMIN', 'INSTRUCTOR'])
}

/**
 * Require admin role only.
 */
export async function requireAdmin(
  request?: NextRequest
): Promise<{ user: AuthUser; role: UserRole } | NextResponse> {
  return requireRole(request, ['ADMIN'])
}
