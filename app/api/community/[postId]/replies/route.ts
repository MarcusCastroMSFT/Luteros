import { NextRequest, NextResponse, connection } from 'next/server'
import { revalidateTag } from 'next/cache'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { sanitizeInput } from '@/lib/utils'

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Rate limiting for replies
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REPLIES = 10 // max 10 replies per minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitStore.get(userId)
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_REPLIES) {
    return false
  }
  
  userLimit.count++
  return true
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    await connection()
    
    const { postId } = await params

    // Validate postId format
    if (!UUID_REGEX.test(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID format' },
        { status: 400 }
      )
    }
    
    // Get current user from Supabase Auth
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to reply' },
        { status: 401 }
      )
    }

    const userId = user.id

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Muitas respostas enviadas. Aguarde um momento.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    
    const { content, isAnonymous } = body

    // Validate required fields
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Validate content length
    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Content exceeds maximum length (2000 characters)' },
        { status: 400 }
      )
    }

    // Sanitize user input
    const sanitizedContent = sanitizeInput(content)

    // Check if post exists
    const post = await prisma.community_posts.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Create the reply
    const newReply = await prisma.community_replies.create({
      data: {
        postId,
        userId,
        content: sanitizedContent,
        isAnonymous: isAnonymous || false,
        isReported: false,
        likeCount: 0,
        updatedAt: new Date(),
      },
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
    })

    // Update the post's reply count and lastReplyAt
    await prisma.community_posts.update({
      where: { id: postId },
      data: {
        replyCount: {
          increment: 1,
        },
        lastReplyAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Format the response
    const authorName = newReply.isAnonymous 
      ? 'Anônimo' 
      : (newReply.user_profiles.displayName || newReply.user_profiles.fullName || 'Usuário')

    // Revalidate community cache
    revalidateTag('community', {})

    return NextResponse.json({
      success: true,
      reply: {
        id: newReply.id,
        content: newReply.content,
        author: authorName,
        isAnonymous: newReply.isAnonymous,
        createdDate: new Intl.DateTimeFormat('pt-BR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(newReply.createdAt),
        likes: 0,
        isReported: false,
      },
      message: 'Reply created successfully',
    })
  } catch (error) {
    console.error('Create reply API error:', error)
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    )
  }
}

// GET - Get all replies for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    await connection()
    
    const { postId } = await params

    const replies: Array<{
      id: string
      content: string
      isAnonymous: boolean
      createdAt: Date
      likeCount: number
      isReported: boolean
      user_profiles: {
        id: string
        fullName: string | null
        displayName: string | null
        avatar: string | null
      }
    }> = await prisma.community_replies.findMany({
      where: { postId },
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
      orderBy: { createdAt: 'asc' },
    })

    const formattedReplies = replies.map((reply) => {
      const authorName = reply.isAnonymous 
        ? 'Anônimo' 
        : (reply.user_profiles.displayName || reply.user_profiles.fullName || 'Usuário')
      
      return {
        id: reply.id,
        content: reply.content,
        author: authorName,
        isAnonymous: reply.isAnonymous,
        createdDate: new Intl.DateTimeFormat('pt-BR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(reply.createdAt),
        likes: reply.likeCount,
        isReported: reply.isReported,
      }
    })

    return NextResponse.json({
      replies: formattedReplies,
      count: formattedReplies.length,
    })
  } catch (error) {
    console.error('Get replies API error:', error)
    return NextResponse.json(
      { error: 'Failed to get replies' },
      { status: 500 }
    )
  }
}
