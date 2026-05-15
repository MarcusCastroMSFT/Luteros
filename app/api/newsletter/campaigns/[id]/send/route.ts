import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { requireAdminOrInstructor } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { newsletterCampaigns, newsletterSubscribers } from '@/lib/db/schema'
import { sendCampaignEmail } from '@/lib/email'

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

    const campaign = await db.select().from(newsletterCampaigns).where(eq(newsletterCampaigns.id, id)).limit(1).then((r) => r[0] ?? null)
    if (!campaign) return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
    if (campaign.status === 'SENDING') return NextResponse.json({ error: 'Esta campanha já está sendo enviada' }, { status: 400 })
    if (campaign.status === 'SENT') return NextResponse.json({ error: 'Esta campanha já foi enviada' }, { status: 400 })

    const subscribers = await db.select({ email: newsletterSubscribers.email, unsubscribeToken: newsletterSubscribers.unsubscribeToken }).from(newsletterSubscribers).where(eq(newsletterSubscribers.status, 'ACTIVE'))
    if (subscribers.length === 0) return NextResponse.json({ error: 'Não há inscritos ativos para enviar' }, { status: 400 })

    await db.update(newsletterCampaigns).set({ status: 'SENDING', totalRecipients: subscribers.length }).where(eq(newsletterCampaigns.id, id))

    let sentCount = 0
    let failedCount = 0
    const errors: string[] = []
    const BATCH_SIZE = 10
    const BATCH_DELAY = 1000

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE)
      const results = await Promise.allSettled(
        batch.map((subscriber: { email: string; unsubscribeToken: string }) =>
          sendCampaignEmail(subscriber.email, { subject: campaign.subject, previewText: campaign.previewText || undefined, content: campaign.content, ctaText: campaign.ctaText || undefined, ctaUrl: campaign.ctaUrl || undefined }, subscriber.unsubscribeToken)
        )
      )
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.success) {
          sentCount++
        } else {
          failedCount++
          if (result.status === 'rejected') errors.push(result.reason?.message || 'Unknown error')
          else if (!result.value.success) errors.push(result.value.error || 'Send failed')
        }
      }
      await db.update(newsletterCampaigns).set({ sentCount, failedCount }).where(eq(newsletterCampaigns.id, id))
      if (i + BATCH_SIZE < subscribers.length) await new Promise(resolve => setTimeout(resolve, BATCH_DELAY))
    }

    const finalStatus = failedCount === subscribers.length ? 'FAILED' : 'SENT'
    const errorMessage = failedCount > 0 ? `${failedCount} emails falharam. ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? '...' : ''}` : null
    await db.update(newsletterCampaigns).set({ status: finalStatus, sentAt: new Date(), sentCount, failedCount, errorMessage: finalStatus === 'FAILED' ? errorMessage : null }).where(eq(newsletterCampaigns.id, id))

    return NextResponse.json({ success: true, stats: { totalRecipients: subscribers.length, sent: sentCount, failed: failedCount, status: finalStatus }, ...(errors.length > 0 && { errors: errors.slice(0, 10) }) })
  } catch (error) {
    console.error('Error sending campaign:', error)
    try {
      const { id } = await params
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido ao enviar campanha'
      await db.update(newsletterCampaigns).set({ status: 'FAILED', errorMessage: errorMsg }).where(eq(newsletterCampaigns.id, id))
    } catch { /* ignore */ }
    return NextResponse.json({ error: 'Erro ao enviar campanha' }, { status: 500 })
  }
}
