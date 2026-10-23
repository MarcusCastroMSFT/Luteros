import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { and, eq, lt, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users, verificationTokens } from '@/lib/db/schema'
import { renderPasswordResetEmail } from '@/lib/account-emails'
import { sendEmail } from '@/lib/email'

const RESET_IDENTIFIER_PREFIX = 'pwreset:'
const TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1)
    .max(254)
    .email(),
})

export async function POST(request: NextRequest) {
  try {
    let payload: unknown
    try {
      payload = await request.json()
    } catch {
      // Always 200 to avoid revealing whether the address exists
      return NextResponse.json({ success: true })
    }

    const parsed = forgotPasswordSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ success: true })
    }

    const normalizedEmail = parsed.data.email
    const identifier = `${RESET_IDENTIFIER_PREFIX}${normalizedEmail}`

    const user = await db
      .select({ id: users.id, email: users.email, name: users.name })
      .from(users)
      .where(sql`lower(${users.email}) = ${normalizedEmail}`)
      .limit(1)
      .then((r) => r[0] ?? null)

    if (!user) {
      return NextResponse.json({ success: true })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + TOKEN_TTL_MS)

    await db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, identifier),
          lt(verificationTokens.expires, new Date(Date.now() + TOKEN_TTL_MS * 2))
        )
      )

    await db.insert(verificationTokens).values({
      identifier,
      token,
      expires,
    })

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutteros.com.br'
    const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`

    const resetEmail = renderPasswordResetEmail({ name: user.name, resetUrl })
    await sendEmail({
      to: normalizedEmail,
      subject: resetEmail.subject,
      html: resetEmail.html,
      text: resetEmail.text,
      tags: [{ name: 'type', value: 'password_reset' }],
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ success: true })
  }
}
