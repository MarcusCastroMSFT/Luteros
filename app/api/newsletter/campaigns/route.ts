import { NextRequest, NextResponse } from 'next/server'
import { desc, eq, ilike, sql } from 'drizzle-orm'
import { requireAdminOrInstructor } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { newsletterCampaigns, users } from '@/lib/db/schema'

// GET /api/newsletter/campaigns - List all campaigns with pagination
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAdminOrInstructor(request)
    if (authUser instanceof NextResponse) return authUser

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '0')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: newsletterCampaigns.id,
          name: newsletterCampaigns.name,
          subject: newsletterCampaigns.subject,
          previewText: newsletterCampaigns.previewText,
          status: newsletterCampaigns.status,
          errorMessage: newsletterCampaigns.errorMessage,
          scheduledAt: newsletterCampaigns.scheduledAt,
          sentAt: newsletterCampaigns.sentAt,
          totalRecipients: newsletterCampaigns.totalRecipients,
          sentCount: newsletterCampaigns.sentCount,
          failedCount: newsletterCampaigns.failedCount,
          createdAt: newsletterCampaigns.createdAt,
          creatorName: users.name,
          creatorDisplayName: users.displayName,
        })
        .from(newsletterCampaigns)
        .innerJoin(users, eq(newsletterCampaigns.createdById, users.id))
        .where(
          search || status
            ? sql`(${search ? sql`(${ilike(newsletterCampaigns.name, `%${search}%`)} OR ${ilike(newsletterCampaigns.subject, `%${search}%`)})` : sql`1=1`}${status ? sql` AND ${eq(newsletterCampaigns.status, status as 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED')}` : sql``})`
            : undefined
        )
        .orderBy(desc(newsletterCampaigns.createdAt))
        .limit(pageSize)
        .offset(page * pageSize),
      db.select({ total: sql<number>`count(*)::int` }).from(newsletterCampaigns).where(
        search || status
          ? sql`(${search ? sql`(${ilike(newsletterCampaigns.name, `%${search}%`)} OR ${ilike(newsletterCampaigns.subject, `%${search}%`)})` : sql`1=1`}${status ? sql` AND ${eq(newsletterCampaigns.status, status as 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED')}` : sql``})`
          : undefined
      ),
    ])

    const formattedCampaigns = rows.map((c) => ({
      id: c.id,
      name: c.name,
      subject: c.subject,
      previewText: c.previewText,
      status: c.status,
      errorMessage: c.errorMessage,
      scheduledAt: c.scheduledAt?.toISOString() || null,
      sentAt: c.sentAt?.toISOString() || null,
      totalRecipients: c.totalRecipients,
      sentCount: c.sentCount,
      failedCount: c.failedCount,
      createdBy: c.creatorDisplayName || c.creatorName || 'Unknown',
      createdAt: c.createdAt.toISOString(),
    }))

    const totalCount = Number(total)
    return NextResponse.json({ data: formattedCampaigns, totalCount, pageCount: Math.ceil(totalCount / pageSize) })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json({ error: 'Erro ao buscar campanhas' }, { status: 500 })
  }
}

// POST /api/newsletter/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAdminOrInstructor(request)
    if (authUser instanceof NextResponse) return authUser

    const body = await request.json()
    const { name, subject, previewText, content, ctaText, ctaUrl, scheduledAt } = body

    if (!name || !subject || !content) return NextResponse.json({ error: 'Nome, assunto e conteúdo são obrigatórios' }, { status: 400 })

    const [campaign] = await db.insert(newsletterCampaigns).values({
      name,
      subject,
      previewText: previewText || null,
      content,
      ctaText: ctaText || null,
      ctaUrl: ctaUrl || null,
      status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      createdById: authUser.user.id,
    }).returning()

    return NextResponse.json({ success: true, campaign: { id: campaign.id, name: campaign.name, subject: campaign.subject, status: campaign.status, createdAt: campaign.createdAt.toISOString() } }, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json({ error: 'Erro ao criar campanha' }, { status: 500 })
  }
}
