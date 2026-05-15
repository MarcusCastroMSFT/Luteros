import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { blogArticles, users } from '@/lib/db/schema'
import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')))
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  try {
    const whereCondition = and(
      eq(blogArticles.isPublished, true),
      category && category !== 'Todos' ? eq(blogArticles.category, category) : undefined,
      search
        ? or(
            ilike(blogArticles.title, `%${search}%`),
            ilike(blogArticles.excerpt, `%${search}%`),
          )
        : undefined,
    )

    const [articles, [{ total }], categories] = await Promise.all([
      db
        .select({
          id: blogArticles.id,
          slug: blogArticles.slug,
          title: blogArticles.title,
          excerpt: blogArticles.excerpt,
          image: blogArticles.image,
          category: blogArticles.category,
          readTime: blogArticles.readTime,
          commentCount: blogArticles.commentCount,
          publishedAt: blogArticles.publishedAt,
          createdAt: blogArticles.createdAt,
          authorName: users.name,
          authorDisplayName: users.displayName,
          authorAvatar: users.image,
        })
        .from(blogArticles)
        .innerJoin(users, eq(blogArticles.authorId, users.id))
        .where(whereCondition)
        .orderBy(desc(blogArticles.publishedAt))
        .offset((page - 1) * limit)
        .limit(limit),
      db.select({ total: sql<number>`count(*)::int` }).from(blogArticles).where(whereCondition),
      db
        .selectDistinct({ category: blogArticles.category })
        .from(blogArticles)
        .where(eq(blogArticles.isPublished, true))
        .orderBy(asc(blogArticles.category)),
    ])

    const transformedArticles = articles.map((article) => {
      const articleDate = article.publishedAt || article.createdAt
      const formattedDate = new Intl.DateTimeFormat('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(articleDate))

      return {
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        image: article.image || '',
        category: article.category,
        author: article.authorName || article.authorDisplayName || 'Unknown',
        authorAvatar: article.authorAvatar || '/images/default-avatar.jpg',
        authorSlug: '',
        date: formattedDate,
        readTime: `${article.readTime} min`,
        commentCount: article.commentCount,
      }
    })

    const totalPages = Math.ceil(total / limit)
    const uniqueCategories = ['Todos', ...categories.map((c) => c.category)]

    return NextResponse.json({
      success: true,
      data: {
        articles: transformedArticles,
        pagination: {
          currentPage: page,
          totalPages,
          totalArticles: total,
          articlesPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        categories: uniqueCategories,
      },
    })
  } catch (error) {
    console.error('Error fetching blog articles:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles', data: null },
      { status: 500 }
    )
  }
}
