import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { requireAdminOrInstructor } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { newsletterCampaigns, newsletterSubscribers } from '@/lib/db/schema'
import { renderCampaignEmail, sendBatchEmails } from '@/lib/email'

// POST /api/newsletter/campaigns/[id]/send - Send campaign to all active subscribers
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) return NextResponse.json({ error: 'Invalid campaign ID' }, { status: 400 })

    const authUser = await requireAdminOrInstructor(request)
    if (authUser instanceof NextResponse) return authUser

    const campaign = await db
      .select()
      .from(newsletterCampaigns)
      .where(eq(newsletterCampaigns.id, id))
      .limit(1)
      .then((r) => r[0] ?? null)
    if (!campaign) return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
    if (campaign.status === 'SENDING') return NextResponse.json({ error: 'Esta campanha já está sendo enviada' }, { status: 400 })
    if (campaign.status === 'SENT') return NextResponse.json({ error: 'Esta campanha já foi enviada' }, { status: 400 })

    const subscribers = await db
      .select({ email: newsletterSubscribers.email, unsubscribeToken: newsletterSubscribers.unsubscribeToken })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.status, 'ACTIVE'))
    if (subscribers.length === 0) return NextResponse.json({ error: 'Não há inscritos ativos para enviar' }, { status: 400 })

    await db
      .update(newsletterCampaigns)
      .set({ status: 'SENDING', totalRecipients: subscribers.length })
      .where(eq(newsletterCampaigns.id, id))

    // Pre-render every recipient's HTML (unique unsubscribe URL per subscriber)
    // then ship them via Resend's batch.send (100 emails per API call) instead
    // of one Resend call per subscriber. For 1000 subscribers: ~150s -> ~5s
    // and 100 API calls -> 10. Removes the function-timeout risk and slashes
    // Vercel compute.
    const payload = {
      subject: campaign.subject,
      previewText: campaign.previewText || undefined,
      content: campaign.content,
      ctaText: campaign.ctaText || undefined,
      ctaUrl: campaign.ctaUrl || undefined,
    }
    const rendered = subscribers.map((s) =>
      renderCampaignEmail(s.email, payload, s.unsubscribeToken),
    )

    const result = await sendBatchEmails({ emails: rendered })

    const finalStatus = result.failed === subscribers.length ? 'FAILED' : 'SENT'
    const errorMessage =
      result.failed > 0
        ? `${result.failed} emails falharam. ${result.errors.slice(0, 3).join('; ')}${result.errors.length > 3 ? '...' : ''}`
        : null

    await db
      .update(newsletterCampaigns)
      .set({
        status: finalStatus,
        sentAt: new Date(),
        sentCount: result.sent,
        failedCount: result.failed,
        errorMessage: finalStatus === 'FAILED' ? errorMessage : null,
      })
      .where(eq(newsletterCampaigns.id, id))

    return NextResponse.json({
      success: true,
      stats: {
        totalRecipients: subscribers.length,
        sent: result.sent,
        failed: result.failed,
        status: finalStatus,
      },
      ...(result.errors.length > 0 && { errors: result.errors.slice(0, 10) }),
    })
  } catch (error) {
    console.error('Error sending campaign:', error)
    try {
      const { id } = await params
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido ao enviar campanha'
      await db
        .update(newsletterCampaigns)
        .set({ status: 'FAILED', errorMessage: errorMsg })
        .where(eq(newsletterCampaigns.id, id))
    } catch {
      /* ignore */
    }
    return NextResponse.json({ error: 'Erro ao enviar campanha' }, { status: 500 })
  }
}
