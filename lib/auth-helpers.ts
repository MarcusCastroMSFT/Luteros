import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { User } from '@supabase/supabase-js'

const AUTH_CACHE_KEY = Symbol.for('supabase.auth.user')

// Extend NextRequest to support our cache key
interface CachedRequest extends NextRequest {
  [AUTH_CACHE_KEY]?: User | null
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
