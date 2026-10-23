import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { requiresEmailVerification, sendVerificationEmail } from '@/lib/email-verification'

const schema = z.object({ email: z.string().trim().toLowerCase().min(1).max(254).email() })

// Always answers 200 so the endpoint does not reveal which addresses have accounts.
export async function POST(request: NextRequest) {
  try {
    const parsed = schema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ success: true })

    const user = await db
      .select({ email: users.email, name: users.name, emailVerified: users.emailVerified, createdAt: users.createdAt })
      .from(users)
      .where(sql`lower(${users.email}) = ${parsed.data.email}`)
      .limit(1)
      .then((r) => r[0] ?? null)

    if (user?.email && requiresEmailVerification(user)) {
      await sendVerificationEmail({ email: user.email, name: user.name })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json({ success: true })
  }
}
