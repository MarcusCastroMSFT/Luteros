import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { User } from '@supabase/supabase-js'

const AUTH_CACHE_KEY = Symbol.for('supabase.auth.user')

/**
 * Get authenticated user with request-level caching
 * This prevents multiple auth checks within the same request
 */
export async function getAuthUser(request: NextRequest): Promise<User | null> {
  // Check if user is already cached in the request context
  const cached = (request as any)[AUTH_CACHE_KEY]
  if (cached !== undefined) {
    return cached
  }

  // Fetch user from Supabase
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Cache the result in the request object
  ;(request as any)[AUTH_CACHE_KEY] = user
  
  return user
}

/**
 * Middleware to verify authentication and cache user
 * Returns 401 if not authenticated
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
