import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

const registerSchema = z.object({
  email: z
    .string({ error: 'E-mail é obrigatório.' })
    .trim()
    .toLowerCase()
    .min(1, 'E-mail é obrigatório.')
    .max(254, 'E-mail muito longo.')
    .email('Endereço de e-mail inválido.'),
  password: z
    .string({ error: 'Senha é obrigatória.' })
    .min(8, 'A senha precisa ter pelo menos 8 caracteres.')
    .max(128, 'Senha muito longa.')
    .regex(/[A-Z]/, 'A senha precisa ter pelo menos uma letra maiúscula.')
    .regex(/[0-9]/, 'A senha precisa ter pelo menos um número.'),
  name: z
    .string()
    .trim()
    .min(1, 'Nome é obrigatório.')
    .max(120, 'Nome muito longo.')
    .nullable()
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    let payload: unknown
    try {
      payload = await request.json()
    } catch {
      return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 })
    }

    const parsed = registerSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' },
        { status: 400 }
      )
    }

    const { email, password, name } = parsed.data

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`lower(${users.email}) = ${email}`)
      .limit(1)
      .then((r) => r[0] ?? null)

    if (existing) {
      return NextResponse.json(
        { error: 'Já existe uma conta com este e-mail.' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 13)

    await db.insert(users).values({
      email,
      password: hashedPassword,
      name: name ?? null,
      role: 'USER',
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
