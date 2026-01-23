import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

// GET /api/newsletter/campaigns/[id] - Get campaign details
export async function GET(
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

    const campaign = await prisma.newsletter_campaigns.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            displayName: true,
            avatar: true,
          }
        }
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campanha não encontrada' },
        { status: 404 }
      )
    }

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
        createdBy: {
          id: campaign.createdBy.id,
          name: campaign.createdBy.displayName || campaign.createdBy.fullName || 'Unknown',
          avatar: campaign.createdBy.avatar,
        },
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString(),
      }
    })
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar campanha' },
      { status: 500 }
    )
  }
}

// PATCH /api/newsletter/campaigns/[id] - Update campaign
export async function PATCH(
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

    // Check if campaign exists and is editable
    const existingCampaign = await prisma.newsletter_campaigns.findUnique({
      where: { id }
    })

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campanha não encontrada' },
        { status: 404 }
      )
    }

    if (existingCampaign.status === 'SENDING' || existingCampaign.status === 'SENT') {
      return NextResponse.json(
        { error: 'Não é possível editar uma campanha que está sendo enviada ou já foi enviada' },
        { status: 400 }
      )
    }

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
      if (scheduledAt && existingCampaign.status === 'DRAFT') {
        updateData.status = 'SCHEDULED'
      }
    }
    if (status !== undefined && ['DRAFT', 'SCHEDULED'].includes(status)) {
      updateData.status = status
    }

    const campaign = await prisma.newsletter_campaigns.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        status: campaign.status,
        updatedAt: campaign.updatedAt.toISOString(),
      }
    })
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar campanha' },
      { status: 500 }
    )
  }
}

// DELETE /api/newsletter/campaigns/[id] - Delete campaign
export async function DELETE(
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

    // Check if user is admin
    const userRole = await prisma.user_roles.findFirst({
      where: {
        userId: user.id,
        role: 'ADMIN'
      }
    })

    if (!userRole) {
      return NextResponse.json(
        { error: 'Apenas administradores podem excluir campanhas' },
        { status: 403 }
      )
    }

    // Check if campaign exists
    const existingCampaign = await prisma.newsletter_campaigns.findUnique({
      where: { id }
    })

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campanha não encontrada' },
        { status: 404 }
      )
    }

    if (existingCampaign.status === 'SENDING') {
      return NextResponse.json(
        { error: 'Não é possível excluir uma campanha que está sendo enviada' },
        { status: 400 }
      )
    }

    await prisma.newsletter_campaigns.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir campanha' },
      { status: 500 }
    )
  }
}
