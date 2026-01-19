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

  // Use getClaims() for fast local JWT validation and token refresh
  // This validates the JWT signature and checks expiration WITHOUT making a server call
  // It's ideal for middleware where performance is critical
  const { data: claims, error: claimsError } = await supabase.auth.getClaims()

  // For protected routes that need full session validation,
  // use getUser() which verifies the session is still active server-side
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard')
  
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
  } else if (claimsError || !claims) {
    // For non-protected routes, just let the request through
    // even if there's no valid session
  }

  return supabaseResponse
}
