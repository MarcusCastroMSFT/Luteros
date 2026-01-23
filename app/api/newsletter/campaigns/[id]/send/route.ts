import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { sendCampaignEmail } from '@/lib/email'

// POST /api/newsletter/campaigns/[id]/send - Send campaign to all active subscribers
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    if (campaign.status === 'SENDING') {
      return NextResponse.json(
        { error: 'Esta campanha já está sendo enviada' },
        { status: 400 }
      )
    }

    if (campaign.status === 'SENT') {
      return NextResponse.json(
        { error: 'Esta campanha já foi enviada' },
        { status: 400 }
      )
    }

    // Get all active subscribers
    const subscribers = await prisma.newsletter_subscribers.findMany({
      where: { status: 'ACTIVE' },
      select: { email: true, unsubscribeToken: true }
    })

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: 'Não há inscritos ativos para enviar' },
        { status: 400 }
      )
    }

    // Update campaign status to SENDING
    await prisma.newsletter_campaigns.update({
      where: { id },
      data: {
        status: 'SENDING',
        totalRecipients: subscribers.length,
      }
    })

    // Send emails (in background, but we'll track progress)
    let sentCount = 0
    let failedCount = 0
    const errors: string[] = []

    // Process in batches to avoid overwhelming the email service
    const BATCH_SIZE = 10
    const BATCH_DELAY = 1000 // 1 second between batches

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE)
      
      const results = await Promise.allSettled(
        batch.map((subscriber: { email: string; unsubscribeToken: string }) =>
          sendCampaignEmail(
            subscriber.email, 
            {
              subject: campaign.subject,
              previewText: campaign.previewText || undefined,
              content: campaign.content,
              ctaText: campaign.ctaText || undefined,
              ctaUrl: campaign.ctaUrl || undefined,
            },
            subscriber.unsubscribeToken
          )
        )
      )

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.success) {
          sentCount++
        } else {
          failedCount++
          if (result.status === 'rejected') {
            errors.push(result.reason?.message || 'Unknown error')
          } else if (!result.value.success) {
            errors.push(result.value.error || 'Send failed')
          }
        }
      }

      // Update progress
      await prisma.newsletter_campaigns.update({
        where: { id },
        data: {
          sentCount,
          failedCount,
        }
      })

      // Delay between batches (except for the last batch)
      if (i + BATCH_SIZE < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY))
      }
    }

    // Update final status
    const finalStatus = failedCount === subscribers.length ? 'FAILED' : 'SENT'
    const errorMessage = failedCount > 0 
      ? `${failedCount} emails falharam. ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? '...' : ''}`
      : null
    
    await prisma.newsletter_campaigns.update({
      where: { id },
      data: {
        status: finalStatus,
        sentAt: new Date(),
        sentCount,
        failedCount,
        errorMessage: finalStatus === 'FAILED' ? errorMessage : null,
      }
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalRecipients: subscribers.length,
        sent: sentCount,
        failed: failedCount,
        status: finalStatus,
      },
      ...(errors.length > 0 && { errors: errors.slice(0, 10) }) // Return first 10 errors
    })
  } catch (error) {
    console.error('Error sending campaign:', error)

    // Try to update campaign status to FAILED
    try {
      const { id } = await params
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido ao enviar campanha'
      await prisma.newsletter_campaigns.update({
        where: { id },
        data: { 
          status: 'FAILED',
          errorMessage: errorMsg,
        }
      })
    } catch {
      // Ignore update errors
    }

    return NextResponse.json(
      { error: 'Erro ao enviar campanha' },
      { status: 500 }
    )
  }
}
