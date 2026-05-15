import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { newsletterSubscribers } from '@/lib/db/schema'

// GET /api/newsletter/unsubscribe?token=xxx - Get subscriber info by token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 400 }
      )
    }

    const subscriber = await db.select({ id: newsletterSubscribers.id, email: newsletterSubscribers.email, status: newsletterSubscribers.status, unsubscribedAt: newsletterSubscribers.unsubscribedAt }).from(newsletterSubscribers).where(eq(newsletterSubscribers.unsubscribeToken, token)).limit(1).then((r) => r[0] ?? null)

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Link de cancelamento inválido ou expirado' },
        { status: 404 }
      )
    }

    // Mask email for privacy
    const emailParts = subscriber.email.split('@')
    const maskedEmail = emailParts[0].substring(0, 2) + '***@' + emailParts[1]

    return NextResponse.json({
      subscriber: {
        id: subscriber.id,
        email: maskedEmail,
        status: subscriber.status,
        alreadyUnsubscribed: subscriber.status === 'UNSUBSCRIBED',
      }
    })
  } catch (error) {
    console.error('Newsletter unsubscribe GET error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/newsletter/unsubscribe - Process unsubscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, reason } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 400 }
      )
    }

    const subscriber = await db.select({ id: newsletterSubscribers.id, email: newsletterSubscribers.email, status: newsletterSubscribers.status, source: newsletterSubscribers.source }).from(newsletterSubscribers).where(eq(newsletterSubscribers.unsubscribeToken, token)).limit(1).then((r) => r[0] ?? null)

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Link de cancelamento inválido ou expirado' },
        { status: 404 }
      )
    }

    if (subscriber.status === 'UNSUBSCRIBED') {
      return NextResponse.json({
        success: true,
        message: 'Sua inscrição já foi cancelada anteriormente.',
        alreadyUnsubscribed: true,
      })
    }

    // Update subscriber status
    await db.update(newsletterSubscribers).set({
      status: 'UNSUBSCRIBED',
      unsubscribedAt: new Date(),
      source: reason ? `unsubscribed: ${reason}` : subscriber.source,
    }).where(eq(newsletterSubscribers.unsubscribeToken, token))

    return NextResponse.json({
      success: true,
      message: 'Sua inscrição foi cancelada com sucesso.',
    })
  } catch (error) {
    console.error('Newsletter unsubscribe POST error:', error)
    return NextResponse.json(
      { error: 'Erro ao processar o cancelamento' },
      { status: 500 }
    )
  }
}
