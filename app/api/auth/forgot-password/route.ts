import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { and, eq, lt, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users, verificationTokens } from '@/lib/db/schema'
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

    await sendEmail({
      to: normalizedEmail,
      subject: 'Redefinição de senha — lutteros',
      html: buildResetEmailHtml({ name: user.name, resetUrl }),
      text: `Olá${user.name ? ` ${user.name}` : ''},\n\nRecebemos um pedido para redefinir sua senha na lutteros. Acesse o link a seguir para criar uma nova senha (válido por 1 hora):\n\n${resetUrl}\n\nSe você não solicitou essa redefinição, ignore este e-mail.`,
      tags: [{ name: 'type', value: 'password_reset' }],
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ success: true })
  }
}

function buildResetEmailHtml({ name, resetUrl }: { name: string | null; resetUrl: string }) {
  const greeting = name ? `Olá, ${name}` : 'Olá'
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<title>Redefinição de senha</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#f7f6f1;color:#1f2a44;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f6f1;padding:32px 0;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;padding:32px;">
        <tr>
          <td>
            <h1 style="margin:0 0 16px;font-size:22px;color:#1f2a44;">Redefinição de senha</h1>
            <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${greeting},</p>
            <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Recebemos um pedido para redefinir sua senha na lutteros. Clique no botão abaixo para criar uma nova senha. Este link é válido por 1 hora.</p>
            <p style="margin:24px 0;text-align:center;">
              <a href="${resetUrl}" style="display:inline-block;background-color:#2a7a78;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:600;">Redefinir minha senha</a>
            </p>
            <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#5a6275;">Se o botão não funcionar, copie e cole este link no navegador:</p>
            <p style="margin:0 0 24px;font-size:13px;line-height:1.5;word-break:break-all;color:#2a7a78;">${resetUrl}</p>
            <p style="margin:0;font-size:13px;line-height:1.5;color:#5a6275;">Se você não solicitou essa redefinição, pode ignorar este e-mail com segurança — sua senha permanecerá a mesma.</p>
          </td>
        </tr>
      </table>
      <p style="margin:24px 0 0;font-size:12px;color:#8a90a0;">© ${new Date().getFullYear()} lutteros</p>
    </td>
  </tr>
</table>
</body>
</html>`
}
