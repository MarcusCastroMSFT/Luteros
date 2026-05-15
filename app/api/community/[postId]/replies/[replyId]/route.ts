import { NextRequest, NextResponse, connection } from 'next/server'
import { revalidateTag } from '@/lib/cache'
import { eq, sql } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { communityPosts, communityReplies, communityReplyLikes, users } from '@/lib/db/schema'

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string; replyId: string }> }
) {
  await connection()

  try {
    const { postId, replyId } = await params

    if (!UUID_REGEX.test(postId) || !UUID_REGEX.test(replyId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }

    const authUser = await requireAuth(request)
    if (authUser instanceof NextResponse) return authUser
    const userId = authUser.id

    const currentUser = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1).then((r) => r[0] ?? null)
    const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'INSTRUCTOR'

    const reply = await db.select({ id: communityReplies.id, userId: communityReplies.userId, postId: communityReplies.postId }).from(communityReplies).where(eq(communityReplies.id, replyId)).limit(1).then((r) => r[0] ?? null)
    if (!reply) return NextResponse.json({ error: 'Reply not found' }, { status: 404 })
    if (reply.postId !== postId) return NextResponse.json({ error: 'Reply does not belong to this post' }, { status: 400 })

    const isAuthor = reply.userId === userId
    if (!isAdmin && !isAuthor) return NextResponse.json({ error: 'Unauthorized - You can only delete your own replies' }, { status: 403 })

    await db.delete(communityReplyLikes).where(eq(communityReplyLikes.replyId, replyId))
    await db.delete(communityReplies).where(eq(communityReplies.id, replyId))
    await db.update(communityPosts).set({ replyCount: sql`GREATEST(${communityPosts.replyCount} - 1, 0)`, updatedAt: new Date() }).where(eq(communityPosts.id, postId))

    revalidateTag('community')
    return NextResponse.json({ success: true, message: 'Reply deleted successfully' })
  } catch (error) {
    console.error('Delete reply API error:', error)
    return NextResponse.json({ error: 'Failed to delete reply' }, { status: 500 })
  }
}
