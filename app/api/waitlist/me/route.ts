import { connection, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getAuthUser } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { subscriptionWaitlist } from '@/lib/db/schema'

// Tells the signed-in user whether their own account e-mail is already on the waitlist.
// It never looks up arbitrary addresses, so it cannot be used to probe who signed up.
export async function GET() {
  await connection()
  try {
    const user = await getAuthUser()
    if (!user?.email) {
      return NextResponse.json({ authenticated: false, onList: false }, { headers: { 'Cache-Control': 'private, no-store' } })
    }

    const email = user.email.trim().toLowerCase()
    const row = await db
      .select({ audience: subscriptionWaitlist.audience })
      .from(subscriptionWaitlist)
      .where(eq(subscriptionWaitlist.email, email))
      .limit(1)
      .then((rows) => rows[0] ?? null)

    return NextResponse.json(
      { authenticated: true, email, onList: row !== null, audience: row?.audience ?? null },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (error) {
    console.error('Waitlist status error:', error instanceof Error ? error.name : 'unknown')
    return NextResponse.json({ error: 'Não foi possível verificar sua inscrição.' }, { status: 500 })
  }
}
