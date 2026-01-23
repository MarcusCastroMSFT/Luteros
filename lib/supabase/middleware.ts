import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // For protected routes that need full session validation,
  // use getUser() which verifies the session is still active server-side
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/admin')
  
  if (isProtectedRoute) {
    // For protected routes, we need full server validation
    // getUser() verifies the session hasn't been revoked/logged out
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
    
    // SECURITY: Middleware provides the first layer of protection
    // Check role from app_metadata (synced from database, stored in JWT)
    // 
    // IMPORTANT: This is a FAST check that doesn't require a database call.
    // The API routes MUST also verify permissions using requireAdmin() which
    // fetches the role from the database - this is defense in depth.
    //
    // If app_metadata.role is not set (new user, or role was just changed),
    // we deny access. The user needs to:
    // 1. Log out and log back in (forces JWT refresh)
    // 2. Or wait for their next profile fetch which syncs the role
    //
    // This fail-safe approach ensures we never accidentally grant admin access.
    const userRole = user.app_metadata?.role
    
    if (userRole !== 'ADMIN') {
      // Redirect non-admin users to home page
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  } else {
    // For non-protected routes, use getClaims() for fast local JWT validation
    // This validates the JWT signature and checks expiration WITHOUT making a server call
    // Also refreshes the session token if needed
    await supabase.auth.getClaims()
  }

  return supabaseResponse
}
