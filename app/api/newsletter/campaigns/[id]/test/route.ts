import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
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

    // Get campaign
    const campaign = await prisma.newsletter_campaigns.findUnique({
      where: { id }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campanha não encontrada' },
        { status: 404 }
      )
    }

    // Send test email with "[TESTE]" prefix in subject
    const result = await sendCampaignEmail(
      email,
      {
        subject: `[TESTE] ${campaign.subject}`,
        previewText: campaign.previewText || undefined,
        content: campaign.content,
        ctaText: campaign.ctaText || undefined,
        ctaUrl: campaign.ctaUrl || undefined,
      }
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Falha ao enviar email de teste' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Email de teste enviado para ${email}`,
    })
  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar email de teste' },
      { status: 500 }
    )
  }
}
