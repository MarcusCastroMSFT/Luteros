import 'server-only'
import crypto from 'crypto'
import { and, eq, gt, sql } from 'drizzle-orm'
import { renderEmailVerificationEmail } from '@/lib/account-emails'
import { db } from '@/lib/db'
import { users, verificationTokens } from '@/lib/db/schema'
import { sendEmail, type EmailResult } from '@/lib/email'
import {
  EMAIL_VERIFICATION_TTL_MS,
  RESEND_COOLDOWN_MS,
  verificationIdentifier,
} from '@/lib/email-verification-policy'
import { LUTTEROS_ENTITY } from '@/lib/legal-entity'

export * from '@/lib/email-verification-policy'

// Only a hash is stored, so a database leak does not expose working links.
export function hashVerificationToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function siteUrl(): string {
  // Never derived from the request Host header: a spoofed host would send the
  // victim a link to an attacker-controlled domain.
  return (process.env.NEXT_PUBLIC_SITE_URL || LUTTEROS_ENTITY.siteUrl).replace(/\/+$/, '')
}

export function buildVerificationUrl(email: string, token: string): string {
  const params = new URLSearchParams({ token, email })
  return `${siteUrl()}/api/auth/verify-email?${params.toString()}`
}

/**
 * Creates a fresh token (replacing older ones) and e-mails the confirmation
 * link. Returns `skipped` when a link was sent less than a minute ago.
 */
export async function sendVerificationEmail(user: { email: string; name: string | null }): Promise<EmailResult> {
  const email = user.email.trim().toLowerCase()
  const identifier = verificationIdentifier(email)

  const recent = await db
    .select({ expires: verificationTokens.expires })
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.identifier, identifier),
        gt(verificationTokens.expires, new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS - RESEND_COOLDOWN_MS)),
      ),
    )
    .limit(1)
  if (recent.length > 0) return { success: true, skipped: true, message: 'cooldown' }

  const token = crypto.randomBytes(32).toString('hex')
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier))
  await db.insert(verificationTokens).values({
    identifier,
    token: hashVerificationToken(token),
    expires: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
  })

  const message = renderEmailVerificationEmail({ name: user.name, verifyUrl: buildVerificationUrl(email, token) })
  return sendEmail({
    to: email,
    subject: message.subject,
    html: message.html,
    text: message.text,
    tags: [{ name: 'type', value: 'email_verification' }],
  })
}

export type VerificationResult = 'verified' | 'expired' | 'invalid'

/** Confirms the address if the token matches, then removes it (single use). */
export async function consumeVerificationToken(email: string, token: string): Promise<VerificationResult> {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail || !/^[a-f0-9]{64}$/.test(token)) return 'invalid'

  const identifier = verificationIdentifier(normalizedEmail)
  const row = await db
    .select({ expires: verificationTokens.expires })
    .from(verificationTokens)
    .where(and(eq(verificationTokens.identifier, identifier), eq(verificationTokens.token, hashVerificationToken(token))))
    .limit(1)
    .then((r) => r[0] ?? null)

  if (!row) return 'invalid'

  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier))
  if (row.expires.getTime() < Date.now()) return 'expired'

  await db
    .update(users)
    .set({ emailVerified: sql`coalesce(${users.emailVerified}, now())`, updatedAt: new Date() })
    .where(sql`lower(${users.email}) = ${normalizedEmail}`)

  return 'verified'
}
