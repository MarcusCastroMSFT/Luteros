import { NextRequest, NextResponse, connection } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { subscriptionWaitlist } from '@/lib/db/schema'
import { validateEmail } from '@/lib/email-validation'

const RATE_LIMIT_WINDOW = 60 * 60 * 1000
const RATE_LIMIT_MAX = 5
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function allowRequest(identifier: string): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

const AUDIENCES = ['general', 'doctors'] as const
type Audience = (typeof AUDIENCES)[number]

export async function POST(request: NextRequest) {
  await connection()

  try {
    const clientIP = getClientIP(request)
    if (!allowRequest(clientIP)) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde um pouco e tente novamente.' },
        { status: 429 }
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 })
    }

    const { email, audience, consent } = (body ?? {}) as Record<string, unknown>

    if (typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'Informe seu e-mail.' }, { status: 400 })
    }
    if (consent !== true) {
      return NextResponse.json(
        { error: 'Confirme que podemos usar seu e-mail para avisar sobre a assinatura.' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()
    const validation = validateEmail(normalizedEmail)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const normalizedAudience: Audience | null =
      typeof audience === 'string' && (AUDIENCES as readonly string[]).includes(audience)
        ? (audience as Audience)
        : null

    // A repeated signup keeps the original row and only refreshes the chosen interest.
    await db
      .insert(subscriptionWaitlist)
      .values({
        email: normalizedEmail,
        audience: normalizedAudience,
        source: 'waitlist-page',
        ipAddress: clientIP,
      })
      .onConflictDoUpdate({
        target: subscriptionWaitlist.email,
        set: {
          audience: sql`coalesce(excluded."audience", ${subscriptionWaitlist.audience})`,
          updatedAt: new Date(),
        },
      })

    return NextResponse.json({
      success: true,
      message: 'Pronto! Avisaremos você por e-mail quando a assinatura estiver disponível.',
    })
  } catch (error) {
    console.error('Subscription waitlist error:', error instanceof Error ? error.name : 'unknown')
    return NextResponse.json(
      { error: 'Não foi possível registrar seu interesse agora. Tente novamente em instantes.' },
      { status: 500 }
    )
  }
}
