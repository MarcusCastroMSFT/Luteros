import { NextRequest, NextResponse, connection } from 'next/server'
import { eq } from 'drizzle-orm'
import { getAuthUser } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { communityLikes } from '@/lib/db/schema'

export async function GET(_request: NextRequest) {
  await connection()

  try {
    const authUser = await getAuthUser()
    if (!authUser) return NextResponse.json({ likedPostIds: [] })

    const likes = await db.select({ postId: communityLikes.postId }).from(communityLikes).where(eq(communityLikes.userId, authUser.id))
    return NextResponse.json({ likedPostIds: likes.map((l) => l.postId) })
  } catch (error) {
    console.error('Get liked posts error:', error)
    return NextResponse.json({ error: 'Failed to get liked posts' }, { status: 500 })
  }
}
