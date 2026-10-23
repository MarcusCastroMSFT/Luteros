import { NextRequest, NextResponse } from 'next/server'
import { consumeVerificationToken } from '@/lib/email-verification'

// Link from the confirmation e-mail. Always lands on the login page, which
// explains the outcome (confirmed, expired or invalid).
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const email = searchParams.get('email') ?? ''
  const token = searchParams.get('token') ?? ''

  const login = new URL('/login', request.nextUrl.origin)
  try {
    const result = await consumeVerificationToken(email, token)
    if (result === 'verified') {
      login.searchParams.set('verified', '1')
    } else {
      login.searchParams.set('error', result === 'expired' ? 'verification_expired' : 'verification_invalid')
    }
  } catch (error) {
    console.error('Verify email error:', error)
    login.searchParams.set('error', 'verification_invalid')
  }

  return NextResponse.redirect(login, { status: 303 })
}
