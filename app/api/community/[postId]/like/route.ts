import { NextRequest, NextResponse, connection } from 'next/server'
import { revalidateTag } from '@/lib/cache'
import { and, eq, sql } from 'drizzle-orm'
import { getAuthUser, requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { communityLikes, communityPosts } from '@/lib/db/schema'

// Rate limiting for likes (prevent spam clicking)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000
const RATE_LIMIT_MAX_LIKES = 30

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitStore.get(userId)
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  if (userLimit.count >= RATE_LIMIT_MAX_LIKES) return false
  userLimit.count++
  return true
}

function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  await connection()

  try {
    const { postId } = await params
    if (!postId || !isValidUUID(postId)) {
      return NextResponse.json({ error: 'Invalid post ID format' }, { status: 400 })
    }

    const authUser = await requireAuth(request)
    if (authUser instanceof NextResponse) return authUser
    const userId = authUser.id

    if (!checkRateLimit(userId)) {
      return NextResponse.json({ error: 'Muitas ações. Aguarde um momento.' }, { status: 429 })
    }

    const post = await db.select({ id: communityPosts.id, likeCount: communityPosts.likeCount }).from(communityPosts).where(eq(communityPosts.id, postId)).limit(1).then((r) => r[0] ?? null)
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    const existingLike = await db
      .select()
      .from(communityLikes)
      .where(and(eq(communityLikes.postId, postId), eq(communityLikes.userId, userId)))
      .limit(1)
      .then((r) => r[0] ?? null)

    if (existingLike) {
      await db.delete(communityLikes).where(and(eq(communityLikes.postId, postId), eq(communityLikes.userId, userId)))
      const [updated] = await db.update(communityPosts).set({ likeCount: sql`GREATEST(${communityPosts.likeCount} - 1, 0)` }).where(eq(communityPosts.id, postId)).returning({ likeCount: communityPosts.likeCount })
      revalidateTag('community')
      return NextResponse.json({ liked: false, likeCount: updated.likeCount, message: 'Post unliked' })
    } else {
      await db.insert(communityLikes).values({ postId, userId })
      const [updated] = await db.update(communityPosts).set({ likeCount: sql`${communityPosts.likeCount} + 1` }).where(eq(communityPosts.id, postId)).returning({ likeCount: communityPosts.likeCount })
      revalidateTag('community')
      return NextResponse.json({ liked: true, likeCount: updated.likeCount, message: 'Post liked' })
    }
  } catch (error) {
    console.error('Like API error:', error)
    return NextResponse.json({ error: 'Failed to process like' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  await connection()

  try {
    const { postId } = await params
    if (!postId || !isValidUUID(postId)) {
      return NextResponse.json({ error: 'Invalid post ID format' }, { status: 400 })
    }

    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ liked: false, likeCount: 0 })
    }

    const [post, existingLike] = await Promise.all([
      db.select({ likeCount: communityPosts.likeCount }).from(communityPosts).where(eq(communityPosts.id, postId)).limit(1).then((r) => r[0] ?? null),
      db.select().from(communityLikes).where(and(eq(communityLikes.postId, postId), eq(communityLikes.userId, authUser.id))).limit(1).then((r) => r[0] ?? null),
    ])

    return NextResponse.json({ liked: !!existingLike, likeCount: post?.likeCount ?? 0 })
  } catch (error) {
    console.error('Get like status error:', error)
    return NextResponse.json({ error: 'Failed to get like status' }, { status: 500 })
  }
}
