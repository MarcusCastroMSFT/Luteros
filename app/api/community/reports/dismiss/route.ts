import { NextRequest, NextResponse, connection } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// POST - Dismiss a report (admin only)
export async function POST(request: NextRequest) {
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
    const userRole = await prisma.user_roles.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    if (!userRole || userRole.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { entityType, entityId } = body

    // Validate required fields
    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'Missing required fields: entityType, entityId' },
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

    // Update entity to mark as not reported
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

      await prisma.community_posts.update({
        where: { id: entityId },
        data: { isReported: false },
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

      await prisma.community_replies.update({
        where: { id: entityId },
        data: { isReported: false },
      })
    }

    // Update all pending reports for this entity to DISMISSED
    await prisma.community_reports.updateMany({
      where: {
        entityType,
        entityId,
        status: 'PENDING',
      },
      data: {
        status: 'DISMISSED',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Report dismissed successfully',
    })
  } catch (error) {
    console.error('Dismiss report error:', error)
    return NextResponse.json(
      { error: 'Failed to dismiss report' },
      { status: 500 }
    )
  }
}
