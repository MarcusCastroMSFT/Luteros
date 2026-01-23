import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

// GET /api/newsletter/campaigns - List all campaigns with pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Check if user is admin or instructor
    const userRole = await prisma.user_roles.findFirst({
      where: {
        userId: user.id,
        role: { in: ['ADMIN', 'INSTRUCTOR'] }
      }
    })

    if (!userRole) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '0')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { subject: { contains: search, mode: 'insensitive' as const } },
        ]
      }),
      ...(status && { status: status as 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED' }),
    }

    const [campaigns, totalCount] = await Promise.all([
      prisma.newsletter_campaigns.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: page * pageSize,
        take: pageSize,
        include: {
          createdBy: {
            select: {
              id: true,
              fullName: true,
              displayName: true,
              avatar: true,
            }
          }
        }
      }),
      prisma.newsletter_campaigns.count({ where })
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedCampaigns = campaigns.map((campaign: any) => ({
      id: campaign.id,
      name: campaign.name,
      subject: campaign.subject,
      previewText: campaign.previewText,
      status: campaign.status,
      errorMessage: campaign.errorMessage,
      scheduledAt: campaign.scheduledAt?.toISOString() || null,
      sentAt: campaign.sentAt?.toISOString() || null,
      totalRecipients: campaign.totalRecipients,
      sentCount: campaign.sentCount,
      failedCount: campaign.failedCount,
      createdBy: campaign.createdBy.displayName || campaign.createdBy.fullName || 'Unknown',
      createdAt: campaign.createdAt.toISOString(),
    }))

    return NextResponse.json({
      data: formattedCampaigns,
      totalCount,
      pageCount: Math.ceil(totalCount / pageSize),
    })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar campanhas' },
      { status: 500 }
    )
  }
}

// POST /api/newsletter/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Check if user is admin or instructor
    const userRole = await prisma.user_roles.findFirst({
      where: {
        userId: user.id,
        role: { in: ['ADMIN', 'INSTRUCTOR'] }
      }
    })

    if (!userRole) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, subject, previewText, content, ctaText, ctaUrl, scheduledAt } = body

    // Validation
    if (!name || !subject || !content) {
      return NextResponse.json(
        { error: 'Nome, assunto e conteúdo são obrigatórios' },
        { status: 400 }
      )
    }

    const campaign = await prisma.newsletter_campaigns.create({
      data: {
        name,
        subject,
        previewText: previewText || null,
        content,
        ctaText: ctaText || null,
        ctaUrl: ctaUrl || null,
        status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        createdById: user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            displayName: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        status: campaign.status,
        createdAt: campaign.createdAt.toISOString(),
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Erro ao criar campanha' },
      { status: 500 }
    )
  }
}
