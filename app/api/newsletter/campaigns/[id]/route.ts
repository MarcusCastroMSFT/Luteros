import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { requireAdmin, requireAdminOrInstructor } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { newsletterCampaigns, users } from '@/lib/db/schema'

// GET /api/newsletter/campaigns/[id] - Get campaign details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const authUser = await requireAdminOrInstructor(request)
    if (authUser instanceof NextResponse) return authUser

    const campaign = await db
      .select({
        id: newsletterCampaigns.id,
        name: newsletterCampaigns.name,
        subject: newsletterCampaigns.subject,
        previewText: newsletterCampaigns.previewText,
        content: newsletterCampaigns.content,
        ctaText: newsletterCampaigns.ctaText,
        ctaUrl: newsletterCampaigns.ctaUrl,
        status: newsletterCampaigns.status,
        scheduledAt: newsletterCampaigns.scheduledAt,
        sentAt: newsletterCampaigns.sentAt,
        totalRecipients: newsletterCampaigns.totalRecipients,
        sentCount: newsletterCampaigns.sentCount,
        failedCount: newsletterCampaigns.failedCount,
        createdAt: newsletterCampaigns.createdAt,
        updatedAt: newsletterCampaigns.updatedAt,
        creatorId: users.id,
        creatorName: users.name,
        creatorDisplayName: users.displayName,
        creatorAvatar: users.image,
      })
      .from(newsletterCampaigns)
      .innerJoin(users, eq(newsletterCampaigns.createdById, users.id))
      .where(eq(newsletterCampaigns.id, id))
      .limit(1)
      .then((r) => r[0] ?? null)

    if (!campaign) return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        previewText: campaign.previewText,
        content: campaign.content,
        ctaText: campaign.ctaText,
        ctaUrl: campaign.ctaUrl,
        status: campaign.status,
        scheduledAt: campaign.scheduledAt?.toISOString() || null,
        sentAt: campaign.sentAt?.toISOString() || null,
        totalRecipients: campaign.totalRecipients,
        sentCount: campaign.sentCount,
        failedCount: campaign.failedCount,
        createdBy: { id: campaign.creatorId, name: campaign.creatorDisplayName || campaign.creatorName || 'Unknown', avatar: campaign.creatorAvatar },
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString(),
      }
    })
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json({ error: 'Erro ao buscar campanha' }, { status: 500 })
  }
}

// PATCH /api/newsletter/campaigns/[id] - Update campaign
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const authUser = await requireAdminOrInstructor(request)
    if (authUser instanceof NextResponse) return authUser

    const existing = await db.select({ id: newsletterCampaigns.id, status: newsletterCampaigns.status }).from(newsletterCampaigns).where(eq(newsletterCampaigns.id, id)).limit(1).then((r) => r[0] ?? null)
    if (!existing) return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
    if (existing.status === 'SENDING' || existing.status === 'SENT') return NextResponse.json({ error: 'Não é possível editar uma campanha que está sendo enviada ou já foi enviada' }, { status: 400 })

    const body = await request.json()
    const { name, subject, previewText, content, ctaText, ctaUrl, scheduledAt, status } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (subject !== undefined) updateData.subject = subject
    if (previewText !== undefined) updateData.previewText = previewText || null
    if (content !== undefined) updateData.content = content
    if (ctaText !== undefined) updateData.ctaText = ctaText || null
    if (ctaUrl !== undefined) updateData.ctaUrl = ctaUrl || null
    if (scheduledAt !== undefined) {
      updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null
      if (scheduledAt && existing.status === 'DRAFT') updateData.status = 'SCHEDULED'
    }
    if (status !== undefined && ['DRAFT', 'SCHEDULED'].includes(status)) updateData.status = status

    const [campaign] = await db.update(newsletterCampaigns).set(updateData).where(eq(newsletterCampaigns.id, id)).returning()

    return NextResponse.json({ success: true, campaign: { id: campaign.id, name: campaign.name, subject: campaign.subject, status: campaign.status, updatedAt: campaign.updatedAt.toISOString() } })
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json({ error: 'Erro ao atualizar campanha' }, { status: 500 })
  }
}

// DELETE /api/newsletter/campaigns/[id] - Delete campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const authUser = await requireAdmin(request)
    if (authUser instanceof NextResponse) return authUser

    const existing = await db.select({ id: newsletterCampaigns.id, status: newsletterCampaigns.status }).from(newsletterCampaigns).where(eq(newsletterCampaigns.id, id)).limit(1).then((r) => r[0] ?? null)
    if (!existing) return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
    if (existing.status === 'SENDING') return NextResponse.json({ error: 'Não é possível excluir uma campanha que está sendo enviada' }, { status: 400 })

    await db.delete(newsletterCampaigns).where(eq(newsletterCampaigns.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json({ error: 'Erro ao excluir campanha' }, { status: 500 })
  }
}
