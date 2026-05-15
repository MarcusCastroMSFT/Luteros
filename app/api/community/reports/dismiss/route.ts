import { NextRequest, NextResponse, connection } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { communityPosts, communityReplies, communityReports } from '@/lib/db/schema'

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// POST - Dismiss a report (admin only)
export async function POST(request: NextRequest) {
  try {
    await connection()

    const authUser = await requireAdmin(request)
    if (authUser instanceof NextResponse) return authUser

    const body = await request.json()
    const { entityType, entityId } = body

    if (!entityType || !entityId) return NextResponse.json({ error: 'Missing required fields: entityType, entityId' }, { status: 400 })
    if (entityType !== 'post' && entityType !== 'reply') return NextResponse.json({ error: 'Invalid entityType' }, { status: 400 })
    if (!UUID_REGEX.test(entityId)) return NextResponse.json({ error: 'Invalid entityId format' }, { status: 400 })

    if (entityType === 'post') {
      const post = await db.select({ id: communityPosts.id }).from(communityPosts).where(eq(communityPosts.id, entityId)).limit(1).then((r) => r[0] ?? null)
      if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      await db.update(communityPosts).set({ isReported: false }).where(eq(communityPosts.id, entityId))
    } else {
      const reply = await db.select({ id: communityReplies.id }).from(communityReplies).where(eq(communityReplies.id, entityId)).limit(1).then((r) => r[0] ?? null)
      if (!reply) return NextResponse.json({ error: 'Reply not found' }, { status: 404 })
      await db.update(communityReplies).set({ isReported: false }).where(eq(communityReplies.id, entityId))
    }

    await db.update(communityReports).set({ status: 'DISMISSED' }).where(and(eq(communityReports.entityType, entityType), eq(communityReports.entityId, entityId), eq(communityReports.status, 'PENDING')))

    return NextResponse.json({ success: true, message: 'Report dismissed successfully' })
  } catch (error) {
    console.error('Dismiss report error:', error)
    return NextResponse.json({ error: 'Failed to dismiss report' }, { status: 500 })
  }
}
