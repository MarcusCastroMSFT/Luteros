import { NextRequest, NextResponse, connection } from 'next/server'
import { revalidateTag } from 'next/cache'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string; replyId: string }> }
) {
  try {
    await connection()
    
    const { postId, replyId } = await params

    // Validate IDs format
    if (!UUID_REGEX.test(postId) || !UUID_REGEX.test(replyId)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      )
    }
    
    // Get current user from Supabase Auth
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    const userId = user.id

    // Get user role to check if admin
    const roleAssignment = await prisma.user_roles.findFirst({
      where: { userId },
      select: { role: true },
      orderBy: { createdAt: 'desc' },
    })

    const userRole = roleAssignment?.role || 'STUDENT'
    const isAdmin = userRole === 'ADMIN' || userRole === 'INSTRUCTOR'

    // Check if reply exists
    const reply = await prisma.community_replies.findUnique({
      where: { id: replyId },
      select: { 
        id: true, 
        userId: true, 
        postId: true 
      },
    })

    if (!reply) {
      return NextResponse.json(
        { error: 'Reply not found' },
        { status: 404 }
      )
    }

    // Verify the reply belongs to the correct post
    if (reply.postId !== postId) {
      return NextResponse.json(
        { error: 'Reply does not belong to this post' },
        { status: 400 }
      )
    }

    const isAuthor = reply.userId === userId

    // Only admin or author can delete
    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only delete your own replies' },
        { status: 403 }
      )
    }

    // Delete related likes first, then the reply
    await prisma.$transaction([
      prisma.community_reply_likes.deleteMany({
        where: { replyId },
      }),
      prisma.community_replies.delete({
        where: { id: replyId },
      }),
    ])

    // Update the post's reply count
    await prisma.community_posts.update({
      where: { id: postId },
      data: {
        replyCount: {
          decrement: 1,
        },
        updatedAt: new Date(),
      },
    })

    // Revalidate community cache
    revalidateTag('community', {})

    return NextResponse.json({
      success: true,
      message: 'Reply deleted successfully',
    })
  } catch (error) {
    console.error('Delete reply API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete reply' },
      { status: 500 }
    )
  }
}
