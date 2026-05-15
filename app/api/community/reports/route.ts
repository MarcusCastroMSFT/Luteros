import { NextRequest, NextResponse, connection } from 'next/server'
import { and, desc, eq } from 'drizzle-orm'
import { getAuthUser, requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { communityPosts, communityReplies, communityReports, users } from '@/lib/db/schema'

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Valid report reasons
const VALID_REASONS = ['spam', 'harassment', 'hate', 'misinformation', 'inappropriate', 'privacy', 'other']

// POST - Create a new report
export async function POST(request: NextRequest) {
  try {
    await connection()
    
    const authUser = await requireAuth(request)
    if (authUser instanceof NextResponse) return authUser
    const reporterId = authUser.id

    const body = await request.json()
    const { entityType, entityId, reason, details } = body

    // Validate required fields
    if (!entityType || !entityId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: entityType, entityId, reason' },
        { status: 400 }
      )
    }

    // Validate entityType
    if (entityType !== 'post' && entityType !== 'reply') {
      return NextResponse.json(
        { error: 'Invalid entityType. Must be "post" or "reply"' },
        { status: 400 }
      )
    }

    // Validate entityId format
    if (!UUID_REGEX.test(entityId)) {
      return NextResponse.json(
        { error: 'Invalid entityId format' },
        { status: 400 }
      )
    }

    // Validate reason
    if (!VALID_REASONS.includes(reason)) {
      return NextResponse.json(
        { error: 'Invalid reason' },
        { status: 400 }
      )
    }

    const existingReport = await db.select().from(communityReports).where(and(eq(communityReports.entityType, entityType), eq(communityReports.entityId, entityId), eq(communityReports.reporterId, reporterId))).limit(1).then((r) => r[0] ?? null)
    if (existingReport) return NextResponse.json({ error: 'You have already reported this item' }, { status: 409 })

    if (entityType === 'post') {
      const post = await db.select({ id: communityPosts.id }).from(communityPosts).where(eq(communityPosts.id, entityId)).limit(1).then((r) => r[0] ?? null)
      if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      await db.update(communityPosts).set({ isReported: true }).where(eq(communityPosts.id, entityId))
    } else {
      const reply = await db.select({ id: communityReplies.id }).from(communityReplies).where(eq(communityReplies.id, entityId)).limit(1).then((r) => r[0] ?? null)
      if (!reply) return NextResponse.json({ error: 'Reply not found' }, { status: 404 })
      await db.update(communityReplies).set({ isReported: true }).where(eq(communityReplies.id, entityId))
    }

    const [report] = await db.insert(communityReports).values({ entityType, entityId, reporterId, reason, details: details || null, status: 'PENDING' }).returning()

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        entityType: report.entityType,
        entityId: report.entityId,
        reason: report.reason,
        status: report.status,
        createdAt: report.createdAt,
      },
      message: 'Report submitted successfully',
    })
  } catch (error) {
    console.error('Create report API error:', error)
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    )
  }
}

// GET - Get reports for an entity (admin only)
export async function GET(request: NextRequest) {
  try {
    await connection()
    
    const authUser = await getAuthUser()
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const currentUser = await db.select({ role: users.role }).from(users).where(eq(users.id, authUser.id)).limit(1).then((r) => r[0] ?? null)
    if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')

    const where = and(
      entityType ? eq(communityReports.entityType, entityType) : undefined,
      entityId ? eq(communityReports.entityId, entityId) : undefined,
    )

    const rows = await db
      .select({
        id: communityReports.id,
        entityType: communityReports.entityType,
        entityId: communityReports.entityId,
        reason: communityReports.reason,
        details: communityReports.details,
        status: communityReports.status,
        createdAt: communityReports.createdAt,
        reporterId: users.id,
        reporterName: users.name,
        reporterDisplayName: users.displayName,
        reporterAvatar: users.image,
      })
      .from(communityReports)
      .innerJoin(users, eq(communityReports.reporterId, users.id))
      .where(where)
      .orderBy(desc(communityReports.createdAt))

    // Map reasons to labels
    const reasonLabels: Record<string, string> = {
      spam: 'Spam ou conteúdo promocional não solicitado',
      harassment: 'Assédio ou bullying',
      hate: 'Discurso de ódio ou discriminação',
      misinformation: 'Informações médicas incorretas',
      inappropriate: 'Conteúdo inapropriado ou ofensivo',
      privacy: 'Violação de privacidade',
      other: 'Outro motivo',
    }

    const formattedReports = rows.map((report) => ({
      id: report.id,
      entityType: report.entityType,
      entityId: report.entityId,
      reason: report.reason,
      reasonLabel: reasonLabels[report.reason] || report.reason,
      details: report.details,
      status: report.status,
      reporter: { id: report.reporterId, name: report.reporterDisplayName || report.reporterName || 'Usuário', avatar: report.reporterAvatar },
      createdAt: report.createdAt.toISOString(),
      createdDateFormatted: new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(report.createdAt),
    }))

    return NextResponse.json({
      reports: formattedReports,
      count: formattedReports.length,
    })
  } catch (error) {
    console.error('Get reports API error:', error)
    return NextResponse.json(
      { error: 'Failed to get reports' },
      { status: 500 }
    )
  }
}
