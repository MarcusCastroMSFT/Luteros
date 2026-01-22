import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { User } from '@supabase/supabase-js'
import prisma from '@/lib/prisma'

const AUTH_CACHE_KEY = Symbol.for('supabase.auth.user')
const ROLE_CACHE_KEY = Symbol.for('supabase.auth.role')

// Valid user roles
type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'

// Extend NextRequest to support our cache keys
interface CachedRequest extends NextRequest {
  [AUTH_CACHE_KEY]?: User | null
  [ROLE_CACHE_KEY]?: UserRole
}

/**
 * Get authenticated user with request-level caching
 * This prevents multiple auth checks within the same request
 * 
 * IMPORTANT: Uses getUser() which validates the session server-side
 * This ensures the user hasn't logged out and the session is still valid
 * Unlike getClaims() which only does local JWT validation
 */
export async function getAuthUser(request: NextRequest): Promise<User | null> {
  // Check if user is already cached in the request context
  const cached = (request as CachedRequest)[AUTH_CACHE_KEY]
  if (cached !== undefined) {
    return cached
  }

  // Fetch user from Supabase using getUser() for full server validation
  // This verifies the session is still active and hasn't been revoked
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Cache the result in the request object
  ;(request as CachedRequest)[AUTH_CACHE_KEY] = user
  
  return user
}

/**
 * Require authentication for API routes
 * Returns the user if authenticated, or a 401 response if not
 * 
 * Uses getUser() for full server-side session validation
 * This is the recommended approach for protecting user data
 */
export async function requireAuth(request: NextRequest): Promise<User | NextResponse> {
  const user = await getAuthUser(request)
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  return user
}

/**
 * Get user's role from database with request-level caching
 * This is a server-side validation to ensure role-based access control
 */
export async function getUserRole(request: NextRequest, userId: string): Promise<UserRole> {
  // Check if role is already cached in the request context
  const cached = (request as CachedRequest)[ROLE_CACHE_KEY]
  if (cached !== undefined) {
    return cached
  }

  // Fetch role from database
  const roleAssignment = await prisma.user_roles.findFirst({
    where: { userId },
    select: { role: true },
    orderBy: { createdAt: 'desc' }
  })
  
  const role = (roleAssignment?.role as UserRole) || 'STUDENT'
  
  // Cache the result in the request object
  ;(request as CachedRequest)[ROLE_CACHE_KEY] = role
  
  return role
}

/**
 * Require specific roles for API routes (authorization)
 * Returns the user if authenticated AND has an allowed role, or an error response
 * 
 * This provides server-side role-based access control
 * @param request - The Next.js request object
 * @param allowedRoles - Array of roles that are allowed to access the resource
 */
export async function requireRole(
  request: NextRequest, 
  allowedRoles: UserRole[]
): Promise<{ user: User; role: UserRole } | NextResponse> {
  // First check authentication
  const user = await getAuthUser(request)
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // Then check authorization (role)
  const role = await getUserRole(request, user.id)
  
  if (!allowedRoles.includes(role)) {
    return NextResponse.json(
      { error: 'Forbidden: Insufficient permissions' },
      { status: 403 }
    )
  }
  
  return { user, role }
}

/**
 * Helper to require admin or instructor role
 * This is the most common authorization check for dashboard routes
 */
export async function requireAdminOrInstructor(
  request: NextRequest
): Promise<{ user: User; role: UserRole } | NextResponse> {
  return requireRole(request, ['ADMIN', 'INSTRUCTOR'])
}

/**
 * Helper to require admin role only
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ user: User; role: UserRole } | NextResponse> {
  return requireRole(request, ['ADMIN'])
}
