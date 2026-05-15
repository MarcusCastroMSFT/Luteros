
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

// proxy.ts replaces middleware.ts in Next.js 16.
// Runs on Node.js runtime (not Edge) — full DB/Node access is available.
// See: https://nextjs.org/docs/app/building-your-application/upgrading/version-16

const ADMIN_ROLES = ['ADMIN', 'INSTRUCTOR'] as const

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

  if (isAdminRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', req.nextUrl.origin)
    loginUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAdminRoute && isLoggedIn) {
    const role = req.auth?.user?.role as string | undefined
    if (!role || !ADMIN_ROLES.includes(role as typeof ADMIN_ROLES[number])) {
      return NextResponse.redirect(new URL('/', req.nextUrl.origin))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
