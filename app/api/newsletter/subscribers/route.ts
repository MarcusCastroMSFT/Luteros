import { NextRequest, NextResponse, connection } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    await connection()

    // Verify authentication and authorization (admin only)
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    // Build where clause
    const where: {
      email?: { contains: string; mode: 'insensitive' }
      status?: 'PENDING' | 'ACTIVE' | 'UNSUBSCRIBED'
    } = {}

    if (search) {
      where.email = { contains: search, mode: 'insensitive' }
    }

    if (status) {
      const statusMap: Record<string, 'PENDING' | 'ACTIVE' | 'UNSUBSCRIBED'> = {
        'Ativo': 'ACTIVE',
        'Pendente': 'PENDING',
        'Cancelado': 'UNSUBSCRIBED',
      }
      if (statusMap[status]) {
        where.status = statusMap[status]
      }
    }

    // Get total count
    const totalCount = await prisma.newsletter_subscribers.count({ where })

    // Get subscribers with pagination
    const subscribers = await prisma.newsletter_subscribers.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: page * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        status: true,
        source: true,
        confirmedAt: true,
        unsubscribedAt: true,
        createdAt: true,
      },
    })

    // Map to expected format
    const mappedSubscribers = subscribers.map((subscriber: {
      id: string
      email: string
      status: string
      source: string | null
      confirmedAt: Date | null
      unsubscribedAt: Date | null
      createdAt: Date
    }) => ({
      id: subscriber.id,
      email: subscriber.email,
      status: subscriber.status === 'ACTIVE' ? 'Ativo' 
        : subscriber.status === 'PENDING' ? 'Pendente' 
        : 'Cancelado',
      source: subscriber.source || 'Desconhecido',
      confirmedAt: subscriber.confirmedAt?.toISOString() || null,
      unsubscribedAt: subscriber.unsubscribedAt?.toISOString() || null,
      createdAt: subscriber.createdAt.toISOString(),
    }))

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      data: mappedSubscribers,
      totalCount,
      pageCount: totalPages,
      pagination: {
        page,
        pageSize: limit,
        totalItems: totalCount,
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
