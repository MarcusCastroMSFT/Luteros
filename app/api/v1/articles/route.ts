import { NextRequest, NextResponse } from 'next/server'
import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { blogArticles, users } from '@/lib/db/schema'

// API Response types for better TypeScript support across platforms
export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  pagination?: {
    currentPage: number
    pageSize: number
    totalCount: number
    pageCount: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  meta?: {
    timestamp: string
    version: string
  }
}

// Mobile-optimized article type (lighter payload)
export interface MobileArticle {
  id: string
  title: string
  excerpt: string
  author: string
  category: string
  status: "Ativo" | "Rascunho" | "Inativo"
  paid: "Gratuito" | "Pago"
  date: string
  readTime: string
  commentCount: number
  // Mobile-specific fields
  imageUrl?: string
  slug?: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Enhanced parameter extraction with mobile defaults
  const page = Math.max(0, parseInt(searchParams.get('page') || '0'))
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10'))) // Limit max page size
  const search = searchParams.get('search') || ''
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'
  
  // Mobile-specific parameters
  const platform = searchParams.get('platform') || 'web' // 'web', 'mobile', 'ios', 'android'
  const includeImages = searchParams.get('includeImages') !== 'false'
  
  // Extract column filters
  const filters: Record<string, string> = {}
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith('filter_')) {
      const filterKey = key.replace('filter_', '')
      filters[filterKey] = value
    }
  }
  
  try {
    // Build where clause for search and filters
    const searchWhere = search ? or(
      ilike(blogArticles.title, `%${search}%`),
      ilike(blogArticles.excerpt, `%${search}%`),
      ilike(users.name, `%${search}%`),
      ilike(blogArticles.category, `%${search}%`),
    ) : undefined

    // Apply status filter
    const statusWhere = filters.status
      ? eq(blogArticles.isPublished, filters.status.toLowerCase() === 'ativo' || filters.status.toLowerCase() === 'published')
      : undefined

    // Apply category filter
    const categoryWhere = filters.category ? eq(blogArticles.category, filters.category) : undefined

    const where = and(searchWhere, statusWhere, categoryWhere)

    // Map sortBy to database columns
    const sortColMap: Record<string, unknown> = {
      date: blogArticles.createdAt, title: blogArticles.title,
      author: users.name, category: blogArticles.category,
    }
    const sortCol = (sortColMap[sortBy] ?? blogArticles.createdAt) as Parameters<typeof asc>[0]
    const orderFn = sortOrder === 'asc' ? asc : desc

    // Get total count
    const [[{ totalCount }], articles] = await Promise.all([
      db.select({ totalCount: sql<number>`count(*)::int` }).from(blogArticles)
        .innerJoin(users, eq(blogArticles.authorId, users.id)).where(where),
      db.select({
        id: blogArticles.id, title: blogArticles.title, excerpt: blogArticles.excerpt,
        slug: blogArticles.slug, authorName: users.name, category: blogArticles.category,
        isPublished: blogArticles.isPublished, accessType: blogArticles.accessType,
        readTime: blogArticles.readTime, createdAt: blogArticles.createdAt,
        image: blogArticles.image, commentCount: blogArticles.commentCount,
      }).from(blogArticles).innerJoin(users, eq(blogArticles.authorId, users.id))
        .where(where).orderBy(orderFn(sortCol)).offset(page * pageSize).limit(pageSize),
    ])
    
    // Transform to mobile-friendly format
    const mobileArticles: MobileArticle[] = articles.map((article) => {
      return {
        id: article.id,
        title: article.title,
        excerpt: article.excerpt || '',
        author: article.authorName || 'Unknown',
        category: article.category || 'General',
        status: article.isPublished ? 'Ativo' : 'Rascunho',
        paid: article.accessType === 'premium' ? 'Pago' : 'Gratuito',
        date: article.createdAt.toLocaleDateString('pt-BR', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        }),
        readTime: article.readTime ? `${article.readTime} min de leitura` : '5 min de leitura',
        commentCount: article.commentCount,
        ...(includeImages && article.image && { imageUrl: article.image }),
        ...(platform === 'web' && { slug: article.slug })
      }
    })
    
    const pageCount = Math.ceil(totalCount / pageSize)
    
    // Enhanced response with mobile-friendly pagination info
    const response: APIResponse<MobileArticle[]> = {
      success: true,
      data: mobileArticles,
      pagination: {
        currentPage: page,
        pageSize,
        totalCount,
        pageCount,
        hasNextPage: page < pageCount - 1,
        hasPreviousPage: page > 0
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error fetching articles:', error)
    
    const errorResponse: APIResponse<never> = {
      success: false,
      error: 'Failed to fetch articles',
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
