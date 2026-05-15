import { NextRequest, NextResponse, connection } from 'next/server'
import { revalidateTag } from '@/lib/cache'
import { asc, eq, sql } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { communityPosts, communityReplies, users } from '@/lib/db/schema'
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
    
    const authUser = await requireAuth(request)
    if (authUser instanceof NextResponse) return authUser
    const userId = authUser.id

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

    const post = await db.select({ id: communityPosts.id }).from(communityPosts).where(eq(communityPosts.id, postId)).limit(1).then((r) => r[0] ?? null)
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    const [newReply] = await db.insert(communityReplies).values({
      postId,
      userId,
      content: sanitizedContent,
      isAnonymous: isAnonymous || false,
      isReported: false,
      likeCount: 0,
    }).returning()

    await db.update(communityPosts).set({ replyCount: sql`${communityPosts.replyCount} + 1`, lastReplyAt: new Date(), updatedAt: new Date() }).where(eq(communityPosts.id, postId))

    const authorRow = await db.select({ name: users.name, displayName: users.displayName }).from(users).where(eq(users.id, userId)).limit(1).then((r) => r[0] ?? null)
    const authorName = newReply.isAnonymous ? 'Anônimo' : (authorRow?.displayName || authorRow?.name || 'Usuário')

    // Revalidate community cache
    revalidateTag('community')

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

// GET - Get paginated replies for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    await connection()
    const { postId } = await params

    const { searchParams } = new URL(request.url)
    const page = Math.max(0, parseInt(searchParams.get('page') || '0'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '50')))

    const rows = await db
      .select({
        id: communityReplies.id,
        content: communityReplies.content,
        isAnonymous: communityReplies.isAnonymous,
        createdAt: communityReplies.createdAt,
        likeCount: communityReplies.likeCount,
        isReported: communityReplies.isReported,
        authorName: users.name,
        authorDisplayName: users.displayName,
      })
      .from(communityReplies)
      .innerJoin(users, eq(communityReplies.userId, users.id))
      .where(eq(communityReplies.postId, postId))
      .orderBy(asc(communityReplies.createdAt))
      .limit(limit)
      .offset(page * limit)

    const formattedReplies = rows.map((reply) => ({
      id: reply.id,
      content: reply.content,
      author: reply.isAnonymous ? 'Anônimo' : (reply.authorDisplayName || reply.authorName || 'Usuário'),
      isAnonymous: reply.isAnonymous,
      createdDate: new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(reply.createdAt),
      likes: reply.likeCount,
      isReported: reply.isReported,
    }))

    return NextResponse.json({ replies: formattedReplies, count: formattedReplies.length, page, limit })
  } catch (error) {
    console.error('Get replies API error:', error)
    return NextResponse.json({ error: 'Failed to get replies' }, { status: 500 })
  }
}
