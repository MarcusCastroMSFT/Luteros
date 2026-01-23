import { NextRequest, NextResponse, connection } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Valid report reasons
const VALID_REASONS = ['spam', 'harassment', 'hate', 'misinformation', 'inappropriate', 'privacy', 'other']

// POST - Create a new report
export async function POST(request: NextRequest) {
  try {
    await connection()
    
    // Get current user from Supabase Auth
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to report' },
        { status: 401 }
      )
    }

    const reporterId = user.id

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

    // Check if user already reported this entity
    const existingReport = await prisma.community_reports.findFirst({
      where: {
        entityType,
        entityId,
        reporterId,
      },
    })

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this item' },
        { status: 409 }
      )
    }

    // Check if entity exists
    if (entityType === 'post') {
      const post = await prisma.community_posts.findUnique({
        where: { id: entityId },
      })
      if (!post) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        )
      }
      // Mark post as reported
      await prisma.community_posts.update({
        where: { id: entityId },
        data: { isReported: true },
      })
    } else {
      const reply = await prisma.community_replies.findUnique({
        where: { id: entityId },
      })
      if (!reply) {
        return NextResponse.json(
          { error: 'Reply not found' },
          { status: 404 }
        )
      }
      // Mark reply as reported
      await prisma.community_replies.update({
        where: { id: entityId },
        data: { isReported: true },
      })
    }

    // Create the report
    const report = await prisma.community_reports.create({
      data: {
        entityType,
        entityId,
        reporterId,
        reason,
        details: details || null,
        status: 'PENDING',
      },
    })

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
    
    // Get current user from Supabase Auth
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const roleAssignment = await prisma.user_roles.findFirst({
      where: { userId: user.id },
      select: { role: true },
      orderBy: { createdAt: 'desc' },
    })

    const userRole = roleAssignment?.role || 'STUDENT'
    const isAdmin = userRole === 'ADMIN' || userRole === 'INSTRUCTOR'

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')

    // Build where condition
    const whereCondition: Record<string, unknown> = {}
    
    if (entityType) {
      whereCondition.entityType = entityType
    }
    
    if (entityId) {
      if (!UUID_REGEX.test(entityId)) {
        return NextResponse.json(
          { error: 'Invalid entityId format' },
          { status: 400 }
        )
      }
      whereCondition.entityId = entityId
    }

    const reports: Array<{
      id: string
      entityType: string
      entityId: string
      reason: string
      details: string | null
      status: string
      createdAt: Date
      user_profiles: {
        id: string
        fullName: string | null
        displayName: string | null
        avatar: string | null
      }
    }> = await prisma.community_reports.findMany({
      where: whereCondition,
      include: {
        user_profiles: {
          select: {
            id: true,
            fullName: true,
            displayName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

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

    const formattedReports = reports.map(report => ({
      id: report.id,
      entityType: report.entityType,
      entityId: report.entityId,
      reason: report.reason,
      reasonLabel: reasonLabels[report.reason] || report.reason,
      details: report.details,
      status: report.status,
      reporter: {
        id: report.user_profiles.id,
        name: report.user_profiles.displayName || report.user_profiles.fullName || 'Usuário',
        avatar: report.user_profiles.avatar,
      },
      createdAt: report.createdAt.toISOString(),
      createdDateFormatted: new Intl.DateTimeFormat('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(report.createdAt),
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
