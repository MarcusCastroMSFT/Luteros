import { NextResponse, connection } from 'next/server'
import { sql } from 'drizzle-orm'
import { requireAdminOrInstructor } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { newsletterCampaigns } from '@/lib/db/schema'

// GET /api/newsletter/campaigns/stats - Get campaign statistics
export async function GET(request: Request) {
  await connection()

  try {
    const authUser = await requireAdminOrInstructor(request as import('next/server').NextRequest)
    if (authUser instanceof NextResponse) return authUser

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [rows] = await db.select({
      total: sql<number>`count(*)::int`,
      draft: sql<number>`count(*) filter (where ${newsletterCampaigns.status} = 'DRAFT')::int`,
      sent: sql<number>`count(*) filter (where ${newsletterCampaigns.status} = 'SENT')::int`,
      scheduled: sql<number>`count(*) filter (where ${newsletterCampaigns.status} = 'SCHEDULED')::int`,
      thisMonth: sql<number>`count(*) filter (where ${newsletterCampaigns.createdAt} >= ${startOfMonth})::int`,
      totalSentCount: sql<number>`coalesce(sum(${newsletterCampaigns.sentCount}), 0)::int`,
      totalFailedCount: sql<number>`coalesce(sum(${newsletterCampaigns.failedCount}), 0)::int`,
    }).from(newsletterCampaigns)

    const totalSent = Number(rows.totalSentCount)
    const totalFailed = Number(rows.totalFailedCount)
    const deliveryRate = totalSent + totalFailed > 0 ? Math.round((totalSent / (totalSent + totalFailed)) * 100) : 100

    return NextResponse.json({
      totalCampaigns: Number(rows.total),
      draftCampaigns: Number(rows.draft),
      sentCampaigns: Number(rows.sent),
      scheduledCampaigns: Number(rows.scheduled),
      campaignsThisMonth: Number(rows.thisMonth),
      totalEmailsSent: totalSent,
      totalEmailsFailed: totalFailed,
      deliveryRate,
    })
  } catch (error) {
    console.error('Error fetching campaign stats:', error)
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 })
  }
}
