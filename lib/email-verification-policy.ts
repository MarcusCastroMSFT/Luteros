// Pure rules for e-mail confirmation (no database), shared by auth and tests.

export const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000
export const RESEND_COOLDOWN_MS = 60 * 1000

/**
 * Accounts created before confirmation was introduced keep signing in as
 * before; every account created from this moment on must confirm its e-mail.
 */
export const EMAIL_VERIFICATION_REQUIRED_SINCE = new Date('2026-10-23T00:00:00Z')

export function verificationIdentifier(email: string): string {
  return `verify:${email.trim().toLowerCase()}`
}

export function requiresEmailVerification(user: { emailVerified: Date | null; createdAt: Date }): boolean {
  return user.emailVerified === null && user.createdAt.getTime() >= EMAIL_VERIFICATION_REQUIRED_SINCE.getTime()
}
