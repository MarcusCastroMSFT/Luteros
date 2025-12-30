import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication (with caching)
    const authUser = await requireAuth(request)
    if (authUser instanceof NextResponse) {
      return authUser // Return 401 response
    }

    // Calculate date ranges
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate())

    // Execute all queries in parallel for performance
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      newArticlesThisMonth,
      newArticlesLastMonth,
      totalViews,
      viewsThisMonth,
      viewsLastMonth,
      totalComments,
      commentsThisMonth,
      commentsLastMonth,
    ] = await Promise.all([
      // Total articles count
      prisma.blogArticle.count(),
      
      // Published articles count
      prisma.blogArticle.count({
        where: { isPublished: true }
      }),
      
      // Draft articles count
      prisma.blogArticle.count({
        where: { isPublished: false }
      }),
      
      // New articles this month
      prisma.blogArticle.count({
        where: {
          createdAt: { gte: lastMonth }
        }
      }),
      
      // New articles last month (for comparison)
      prisma.blogArticle.count({
        where: {
          createdAt: {
            gte: twoMonthsAgo,
            lt: lastMonth
          }
        }
      }),
      
      // Total views (sum)
      prisma.blogArticle.aggregate({
        _sum: { viewCount: true }
      }),
      
      // Views this month (articles created/updated this month)
      prisma.blogArticle.aggregate({
        _sum: { viewCount: true },
        where: {
          updatedAt: { gte: lastMonth }
        }
      }),
      
      // Views last month (for comparison)
      prisma.blogArticle.aggregate({
        _sum: { viewCount: true },
        where: {
          updatedAt: {
            gte: twoMonthsAgo,
            lt: lastMonth
          }
        }
      }),
      
      // Total comments
      prisma.blogArticle.aggregate({
        _sum: { commentCount: true }
      }),
      
      // Comments this month
      prisma.blogArticle.aggregate({
        _sum: { commentCount: true },
        where: {
          updatedAt: { gte: lastMonth }
        }
      }),
      
      // Comments last month
      prisma.blogArticle.aggregate({
        _sum: { commentCount: true },
        where: {
          updatedAt: {
            gte: twoMonthsAgo,
            lt: lastMonth
          }
        }
      }),
    ])

    // Calculate growth percentages
    const articlesGrowth = newArticlesLastMonth > 0
      ? ((newArticlesThisMonth - newArticlesLastMonth) / newArticlesLastMonth * 100).toFixed(1)
      : '0.0'
    
    const viewsGrowthNum = (viewsThisMonth._sum.viewCount || 0) - (viewsLastMonth._sum.viewCount || 0)
    const viewsGrowth = (viewsLastMonth._sum.viewCount || 0) > 0
      ? (viewsGrowthNum / (viewsLastMonth._sum.viewCount || 1) * 100).toFixed(1)
      : '0.0'
    
    const activeArticlesGrowth = newArticlesLastMonth > 0
      ? ((publishedArticles - (publishedArticles - newArticlesThisMonth)) / (publishedArticles - newArticlesThisMonth) * 100).toFixed(1)
      : '0.0'
    
    const commentsGrowthNum = (commentsThisMonth._sum.commentCount || 0) - (commentsLastMonth._sum.commentCount || 0)
    const commentsGrowth = (commentsLastMonth._sum.commentCount || 0) > 0
      ? (commentsGrowthNum / (commentsLastMonth._sum.commentCount || 1) * 100).toFixed(1)
      : '0.0'

    return NextResponse.json({
      totalArticles,
      totalArticlesGrowth: articlesGrowth,
      newArticlesThisMonth,
      
      totalViews: totalViews._sum.viewCount || 0,
      totalViewsGrowth: viewsGrowth,
      viewsThisMonth: viewsThisMonth._sum.viewCount || 0,
      
      publishedArticles,
      activeArticlesGrowth,
      draftArticles,
      
      totalComments: totalComments._sum.commentCount || 0,
      totalCommentsGrowth: commentsGrowth,
      commentsThisMonth: commentsThisMonth._sum.commentCount || 0,
    })
  } catch (error) {
    console.error('Error fetching article stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article statistics' },
      { status: 500 }
    )
  }
}
