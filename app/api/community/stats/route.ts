import { NextRequest, NextResponse, connection } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { communityPosts, communityReplies, communityLikes, users } from '@/lib/db/schema'

export async function GET(request: NextRequest) {
  await connection()

  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) return authResult

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const prev7d = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const [postStats, [activeMembers], [interactions]] = await Promise.all([
      db
        .select({
          totalPosts: sql<number>`count(*)::int`,
          newThisMonth: sql<number>`count(*) filter (where ${communityPosts.createdAt} >= ${startOfMonth})::int`,
          newPrevMonth: sql<number>`count(*) filter (where ${communityPosts.createdAt} >= ${startOfPrevMonth} and ${communityPosts.createdAt} < ${startOfMonth})::int`,
          newThisWeek: sql<number>`count(*) filter (where ${communityPosts.createdAt} >= ${last7d})::int`,
          moderatedPosts: sql<number>`count(*) filter (where ${communityPosts.status} = 'MODERATION' or ${communityPosts.isReported} = true)::int`,
          moderatedPrevMonth: sql<number>`count(*) filter (where (${communityPosts.status} = 'MODERATION' or ${communityPosts.isReported} = true) and ${communityPosts.updatedAt} >= ${startOfPrevMonth} and ${communityPosts.updatedAt} < ${startOfMonth})::int`,
        })
        .from(communityPosts),

      // Active members = unique users who posted or replied in the last 7 days
      db
        .select({
          count: sql<number>`(
            select count(distinct user_id)::int from (
              select ${communityPosts.userId} as user_id from ${communityPosts}
                where ${communityPosts.createdAt} >= ${last7d}
              union
              select ${communityReplies.userId} as user_id from ${communityReplies}
                where ${communityReplies.createdAt} >= ${last7d}
            ) as active
          )`,
          prevCount: sql<number>`(
            select count(distinct user_id)::int from (
              select ${communityPosts.userId} as user_id from ${communityPosts}
                where ${communityPosts.createdAt} >= ${prev7d} and ${communityPosts.createdAt} < ${last7d}
              union
              select ${communityReplies.userId} as user_id from ${communityReplies}
                where ${communityReplies.createdAt} >= ${prev7d} and ${communityReplies.createdAt} < ${last7d}
            ) as active_prev
          )`,
        })
        .from(users)
        .limit(1),

      // Interactions = replies + likes
      db
        .select({
          totalReplies: sql<number>`(select count(*)::int from ${communityReplies})`,
          totalLikes: sql<number>`(select count(*)::int from ${communityLikes})`,
          repliesThisMonth: sql<number>`(select count(*)::int from ${communityReplies} where "createdAt" >= ${startOfMonth})`,
          repliesPrevMonth: sql<number>`(select count(*)::int from ${communityReplies} where "createdAt" >= ${startOfPrevMonth} and "createdAt" < ${startOfMonth})`,
        })
        .from(users)
        .limit(1),
    ])

    const stats = postStats[0]
    const totalPosts = Number(stats.totalPosts)
    const newThisMonth = Number(stats.newThisMonth)
    const newPrevMonth = Number(stats.newPrevMonth)
    const newThisWeek = Number(stats.newThisWeek)
    const moderatedPosts = Number(stats.moderatedPosts)
    const moderatedPrevMonth = Number(stats.moderatedPrevMonth)

    const totalReplies = Number(interactions.totalReplies)
    const totalLikes = Number(interactions.totalLikes)
    const repliesThisMonth = Number(interactions.repliesThisMonth)
    const repliesPrevMonth = Number(interactions.repliesPrevMonth)

    const postsGrowth = newPrevMonth > 0
      ? Math.round(((newThisMonth - newPrevMonth) / newPrevMonth) * 100)
      : newThisMonth > 0 ? 100 : 0

    const activeMembersCount = Number(activeMembers?.count ?? 0)
    const prevActiveMembersCount = Number(activeMembers?.prevCount ?? 0)
    const membersGrowth = prevActiveMembersCount > 0
      ? Math.round(((activeMembersCount - prevActiveMembersCount) / prevActiveMembersCount) * 100)
      : activeMembersCount > 0 ? 100 : 0

    // For moderation, a *decrease* is good
    const moderatedGrowth = moderatedPrevMonth > 0
      ? Math.round(((moderatedPosts - moderatedPrevMonth) / moderatedPrevMonth) * 100)
      : 0

    const interactionsGrowth = repliesPrevMonth > 0
      ? Math.round(((repliesThisMonth - repliesPrevMonth) / repliesPrevMonth) * 100)
      : repliesThisMonth > 0 ? 100 : 0

    return NextResponse.json({
      totalPosts,
      newPostsThisWeek: newThisWeek,
      postsGrowth,
      activeMembers: activeMembersCount,
      membersGrowth,
      moderatedPosts,
      moderatedGrowth,
      totalInteractions: totalReplies + totalLikes,
      interactionsGrowth,
    })
  } catch (error) {
    console.error('Error fetching community stats:', error)
    return NextResponse.json({ error: 'Failed to fetch community stats' }, { status: 500 })
  }
}
