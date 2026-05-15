import { NextRequest, NextResponse, connection } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { blogArticles } from '@/lib/db/schema'
import { and, eq, gte, lt, sql } from 'drizzle-orm'

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

    const [
      [{ total }],
      [{ published }],
      [{ draft }],
      [{ newThisMonth }],
      [{ newLastMonth }],
      [{ totalComments }],
      [{ commentsThisMonth }],
      [{ commentsLastMonth }],
    ] = await Promise.all([
      db.select({ total: sql<number>`count(*)::int` }).from(blogArticles),
      db.select({ published: sql<number>`count(*)::int` }).from(blogArticles).where(eq(blogArticles.isPublished, true)),
      db.select({ draft: sql<number>`count(*)::int` }).from(blogArticles).where(eq(blogArticles.isPublished, false)),
      db.select({ newThisMonth: sql<number>`count(*)::int` }).from(blogArticles).where(gte(blogArticles.createdAt, lastMonth)),
      db.select({ newLastMonth: sql<number>`count(*)::int` }).from(blogArticles).where(and(gte(blogArticles.createdAt, twoMonthsAgo), lt(blogArticles.createdAt, lastMonth))),
      db.select({ totalComments: sql<number>`coalesce(sum(${blogArticles.commentCount}), 0)::int` }).from(blogArticles),
      db.select({ commentsThisMonth: sql<number>`coalesce(sum(${blogArticles.commentCount}), 0)::int` }).from(blogArticles).where(gte(blogArticles.updatedAt, lastMonth)),
      db.select({ commentsLastMonth: sql<number>`coalesce(sum(${blogArticles.commentCount}), 0)::int` }).from(blogArticles).where(and(gte(blogArticles.updatedAt, twoMonthsAgo), lt(blogArticles.updatedAt, lastMonth))),
    ])

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
