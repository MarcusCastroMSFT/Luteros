import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

// GET /api/newsletter/campaigns/stats - Get campaign statistics
export async function GET() {
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

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalCampaigns,
      draftCampaigns,
      sentCampaigns,
      scheduledCampaigns,
      campaignsThisMonth,
      totalEmailsSent,
      totalEmailsFailed,
    ] = await Promise.all([
      prisma.newsletter_campaigns.count(),
      prisma.newsletter_campaigns.count({ where: { status: 'DRAFT' } }),
      prisma.newsletter_campaigns.count({ where: { status: 'SENT' } }),
      prisma.newsletter_campaigns.count({ where: { status: 'SCHEDULED' } }),
      prisma.newsletter_campaigns.count({
        where: { createdAt: { gte: startOfMonth } }
      }),
      prisma.newsletter_campaigns.aggregate({
        _sum: { sentCount: true }
      }),
      prisma.newsletter_campaigns.aggregate({
        _sum: { failedCount: true }
      }),
    ])

    const totalSent = totalEmailsSent._sum.sentCount || 0
    const totalFailed = totalEmailsFailed._sum.failedCount || 0
    const deliveryRate = totalSent + totalFailed > 0 
      ? Math.round((totalSent / (totalSent + totalFailed)) * 100)
      : 100

    return NextResponse.json({
      totalCampaigns,
      draftCampaigns,
      sentCampaigns,
      scheduledCampaigns,
      campaignsThisMonth,
      totalEmailsSent: totalSent,
      totalEmailsFailed: totalFailed,
      deliveryRate,
    })
  } catch (error) {
    console.error('Error fetching campaign stats:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}
