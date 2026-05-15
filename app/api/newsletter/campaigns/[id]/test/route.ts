import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { requireAdminOrInstructor } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { newsletterCampaigns } from '@/lib/db/schema'
import { sendCampaignEmail } from '@/lib/email'

// POST /api/newsletter/campaigns/[id]/test - Send test email to specified address
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    const authUser = await requireAdminOrInstructor(request)
    if (authUser instanceof NextResponse) return authUser

    const campaign = await db.select().from(newsletterCampaigns).where(eq(newsletterCampaigns.id, id)).limit(1).then((r) => r[0] ?? null)
    if (!campaign) return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })

    const result = await sendCampaignEmail(
      email,
      { subject: `[TESTE] ${campaign.subject}`, previewText: campaign.previewText || undefined, content: campaign.content, ctaText: campaign.ctaText || undefined, ctaUrl: campaign.ctaUrl || undefined }
    )

    if (!result.success) return NextResponse.json({ error: result.error || 'Falha ao enviar email de teste' }, { status: 500 })

    return NextResponse.json({ success: true, message: `Email de teste enviado para ${email}` })
  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json({ error: 'Erro ao enviar email de teste' }, { status: 500 })
  }
}
