import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

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
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { authorName: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    // Apply status filter if provided
    if (filters.status) {
      const statusMap: Record<string, string> = {
        'ativo': 'published',
        'rascunho': 'draft',
        'inativo': 'archived'
      }
      where.status = statusMap[filters.status.toLowerCase()] || filters.status
    }
    
    // Apply category filter if provided
    if (filters.category) {
      where.category = { equals: filters.category, mode: 'insensitive' }
    }
    
    // Map sortBy to database columns
    const sortByMap: Record<string, string> = {
      'date': 'createdAt',
      'title': 'title',
      'author': 'authorName',
      'category': 'category'
    }
    const dbSortBy = sortByMap[sortBy] || 'createdAt'
    
    // Get total count
    const totalCount = await prisma.article.count({ where })
    
    // Define article select type
    type ArticleSelect = {
      id: string
      title: string
      excerpt: string | null
      slug: string
      authorName: string | null
      category: string | null
      status: string
      isPremium: boolean
      readTime: string | null
      createdAt: Date
      featuredImage: string | null
    }
    
    // Fetch articles from database
    const articles: ArticleSelect[] = await prisma.article.findMany({
      where,
      orderBy: { [dbSortBy]: sortOrder as 'asc' | 'desc' },
      skip: page * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        excerpt: true,
        slug: true,
        authorName: true,
        category: true,
        status: true,
        isPremium: true,
        readTime: true,
        createdAt: true,
        featuredImage: true,
      }
    })
    
    // Transform to mobile-friendly format
    const mobileArticles: MobileArticle[] = articles.map((article) => {
      // Map database status to display status
      const statusMap: Record<string, "Ativo" | "Rascunho" | "Inativo"> = {
        'published': 'Ativo',
        'draft': 'Rascunho',
        'archived': 'Inativo'
      }
      
      return {
        id: article.id,
        title: article.title,
        excerpt: article.excerpt || '',
        author: article.authorName || 'Unknown',
        category: article.category || 'General',
        status: statusMap[article.status] || 'Ativo',
        paid: article.isPremium ? 'Pago' : 'Gratuito',
        date: article.createdAt.toLocaleDateString('pt-BR', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        }),
        readTime: article.readTime || '5 min de leitura',
        commentCount: 0, // TODO: Add comment count when comments are implemented
        ...(includeImages && article.featuredImage && { imageUrl: article.featuredImage }),
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
