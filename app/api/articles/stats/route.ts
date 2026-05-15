import { NextRequest, NextResponse, connection } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { blogArticles } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  await connection()

  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate())

    const [{ total, published, draft, newThisMonth, newLastMonth, totalComments, commentsThisMonth, commentsLastMonth }] = await db
      .select({
        total: sql<number>`count(*)::int`,
        published: sql<number>`count(*) filter (where ${blogArticles.isPublished} = true)::int`,
        draft: sql<number>`count(*) filter (where ${blogArticles.isPublished} = false)::int`,
        newThisMonth: sql<number>`count(*) filter (where ${blogArticles.createdAt} >= ${lastMonth})::int`,
        newLastMonth: sql<number>`count(*) filter (where ${blogArticles.createdAt} >= ${twoMonthsAgo} and ${blogArticles.createdAt} < ${lastMonth})::int`,
        totalComments: sql<number>`coalesce(sum(${blogArticles.commentCount}), 0)::int`,
        commentsThisMonth: sql<number>`coalesce(sum(${blogArticles.commentCount}) filter (where ${blogArticles.updatedAt} >= ${lastMonth}), 0)::int`,
        commentsLastMonth: sql<number>`coalesce(sum(${blogArticles.commentCount}) filter (where ${blogArticles.updatedAt} >= ${twoMonthsAgo} and ${blogArticles.updatedAt} < ${lastMonth}), 0)::int`,
      })
      .from(blogArticles)

    const articlesGrowth = newLastMonth > 0
      ? ((newThisMonth - newLastMonth) / newLastMonth * 100).toFixed(1)
      : '0.0'

    const activeArticlesGrowth = newLastMonth > 0
      ? ((published - (published - newThisMonth)) / (published - newThisMonth) * 100).toFixed(1)
      : '0.0'

    const commentsGrowthNum = commentsThisMonth - commentsLastMonth
    const commentsGrowth = commentsLastMonth > 0
      ? (commentsGrowthNum / commentsLastMonth * 100).toFixed(1)
      : '0.0'

    return NextResponse.json({
      totalArticles: total,
      totalArticlesGrowth: articlesGrowth,
      newArticlesThisMonth: newThisMonth,
      publishedArticles: published,
      activeArticlesGrowth,
      draftArticles: draft,
      totalComments,
      totalCommentsGrowth: commentsGrowth,
      commentsThisMonth,
    })
  } catch (error) {
    console.error('Error fetching article stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article statistics' },
      { status: 500 }
    )
  }
}
