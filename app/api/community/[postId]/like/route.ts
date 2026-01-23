import { NextRequest, NextResponse, connection } from 'next/server'
import { revalidateTag } from 'next/cache'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { Prisma } from '@prisma/client'

// Rate limiting for likes (prevent spam clicking)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_LIKES = 30 // max 30 like actions per minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitStore.get(userId)
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_LIKES) {
    return false
  }
  
  userLimit.count++
  return true
}

// Validate UUID format (UUIDv7 or standard UUID)
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

// Define transaction client type
type TransactionClient = Prisma.TransactionClient

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    await connection()
    
    const { postId } = await params

    // Validate postId format
    if (!postId || !isValidUUID(postId)) {
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
        { error: 'Unauthorized - Please log in to like posts' },
        { status: 401 }
      )
    }

    const userId = user.id

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Muitas ações. Aguarde um momento.' },
        { status: 429 }
      )
    }

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

    // Check if user already liked this post
    const existingLike = await prisma.community_likes.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    })

    if (existingLike) {
      // Unlike - remove the like (use transaction for atomicity)
      const updatedPost = await prisma.$transaction(async (tx: TransactionClient) => {
        await tx.community_likes.delete({
          where: {
            postId_userId: {
              postId,
              userId,
            },
          },
        })

        return tx.community_posts.update({
          where: { id: postId },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
          select: {
            likeCount: true,
          },
        })
      })

      revalidateTag('community', {})

      return NextResponse.json({
        liked: false,
        likeCount: Math.max(0, updatedPost.likeCount), // Ensure non-negative
        message: 'Post unliked',
      })
    } else {
      // Like - add the like (use transaction for atomicity)
      const updatedPost = await prisma.$transaction(async (tx: TransactionClient) => {
        await tx.community_likes.create({
          data: {
            postId,
            userId,
          },
        })

        return tx.community_posts.update({
          where: { id: postId },
          data: {
            likeCount: {
              increment: 1,
            },
          },
          select: {
            likeCount: true,
          },
        })
      })

      revalidateTag('community', {})

      return NextResponse.json({
        liked: true,
        likeCount: updatedPost.likeCount,
        message: 'Post liked',
      })
    }
  } catch (error) {
    console.error('Like API error:', error)
    return NextResponse.json(
      { error: 'Failed to process like' },
      { status: 500 }
    )
  }
}

// GET - Check if user has liked a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    await connection()
    
    const { postId } = await params

    // Validate postId format
    if (!postId || !isValidUUID(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID format' },
        { status: 400 }
      )
    }
    
    // Get current user from Supabase Auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({
        liked: false,
        likeCount: 0,
      })
    }

    const userId = user.id

    // Get post like count and check if user liked it
    const [post, existingLike] = await Promise.all([
      prisma.community_posts.findUnique({
        where: { id: postId },
        select: { likeCount: true },
      }),
      prisma.community_likes.findUnique({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      }),
    ])

    return NextResponse.json({
      liked: !!existingLike,
      likeCount: post?.likeCount ?? 0,
    })
  } catch (error) {
    console.error('Get like status error:', error)
    return NextResponse.json(
      { error: 'Failed to get like status' },
      { status: 500 }
    )
  }
}
