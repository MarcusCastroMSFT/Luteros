import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { and, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users, verificationTokens } from '@/lib/db/schema'

const RESET_IDENTIFIER_PREFIX = 'pwreset:'

const resetPasswordSchema = z.object({
  token: z
    .string()
    .trim()
    .min(32, 'Token inválido.')
    .max(256, 'Token inválido.')
    .regex(/^[a-f0-9]+$/i, 'Token inválido.'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1)
    .max(254)
    .email('E-mail inválido.'),
  password: z
    .string()
    .min(8, 'A senha precisa ter pelo menos 8 caracteres.')
    .max(128, 'Senha muito longa.')
    .regex(/[A-Z]/, 'A senha precisa ter pelo menos uma letra maiúscula.')
    .regex(/[0-9]/, 'A senha precisa ter pelo menos um número.'),
})

export async function POST(request: NextRequest) {
  try {
    let payload: unknown
    try {
      payload = await request.json()
    } catch {
      return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 })
    }

    const parsed = resetPasswordSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Dados inválidos. Solicite um novo link de redefinição.' },
        { status: 400 }
      )
    }

    const { token, email: normalizedEmail, password } = parsed.data
    const identifier = `${RESET_IDENTIFIER_PREFIX}${normalizedEmail}`

    const record = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, identifier),
          eq(verificationTokens.token, token)
        )
      )
      .limit(1)
      .then((r) => r[0] ?? null)

    if (!record) {
      return NextResponse.json(
        { error: 'Link inválido ou já utilizado. Solicite um novo.' },
        { status: 400 }
      )
    }

    if (record.expires.getTime() < Date.now()) {
      await db
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, identifier),
            eq(verificationTokens.token, token)
          )
        )
      return NextResponse.json(
        { error: 'Link expirado. Solicite um novo.' },
        { status: 400 }
      )
    }

    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`lower(${users.email}) = ${normalizedEmail}`)
      .limit(1)
      .then((r) => r[0] ?? null)

    if (!user) {
      await db
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, identifier),
            eq(verificationTokens.token, token)
          )
        )
      return NextResponse.json(
        { error: 'Link inválido. Solicite um novo.' },
        { status: 400 }
      )
    }

    const hashed = await bcrypt.hash(password, 13)

    await db.update(users).set({ password: hashed, updatedAt: new Date() }).where(eq(users.id, user.id))

    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, identifier))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Erro ao redefinir a senha. Tente novamente.' },
      { status: 500 }
    )
  }
}
