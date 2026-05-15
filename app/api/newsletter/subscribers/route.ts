import { NextRequest, NextResponse, connection } from 'next/server'
import { db } from '@/lib/db'
import { newsletterSubscribers } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/auth-helpers'
import { and, desc, eq, ilike, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    await connection()

    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const statusMap: Record<string, 'PENDING' | 'ACTIVE' | 'UNSUBSCRIBED'> = {
      'Ativo': 'ACTIVE',
      'Pendente': 'PENDING',
      'Cancelado': 'UNSUBSCRIBED',
    }
    const dbStatus = statusMap[status]

    const whereCondition = and(
      search ? ilike(newsletterSubscribers.email, `%${search}%`) : undefined,
      dbStatus ? eq(newsletterSubscribers.status, dbStatus) : undefined,
    )

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(newsletterSubscribers)
      .where(whereCondition)

    const subscribers = await db
      .select({
        id: newsletterSubscribers.id,
        email: newsletterSubscribers.email,
        status: newsletterSubscribers.status,
        source: newsletterSubscribers.source,
        confirmedAt: newsletterSubscribers.confirmedAt,
        unsubscribedAt: newsletterSubscribers.unsubscribedAt,
        createdAt: newsletterSubscribers.createdAt,
      })
      .from(newsletterSubscribers)
      .where(whereCondition)
      .orderBy(desc(newsletterSubscribers.createdAt))
      .offset(page * limit)
      .limit(limit)

    const mappedSubscribers = subscribers.map((s) => ({
      id: s.id,
      email: s.email,
      status: s.status === 'ACTIVE' ? 'Ativo' : s.status === 'PENDING' ? 'Pendente' : 'Cancelado',
      source: s.source || 'Desconhecido',
      confirmedAt: s.confirmedAt?.toISOString() || null,
      unsubscribedAt: s.unsubscribedAt?.toISOString() || null,
      createdAt: s.createdAt.toISOString(),
    }))

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data: mappedSubscribers,
      totalCount: total,
      pageCount: totalPages,
      pagination: {
        page,
        pageSize: limit,
        totalItems: total,
        totalPages,
        hasNextPage: page < totalPages - 1,
        hasPreviousPage: page > 0,
      },
    })
  } catch (error) {
    console.error('Newsletter subscribers API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    )
  }
}
