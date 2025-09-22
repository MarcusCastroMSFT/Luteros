import { NextRequest, NextResponse } from 'next/server'
import { sampleArticles } from '@/data/articles'

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

// Helper functions (same as before)
function getArticleStatus(index: number): "Ativo" | "Rascunho" | "Inativo" {
  const statuses = ["Ativo", "Ativo", "Ativo", "Rascunho", "Ativo", "Inativo", "Ativo", "Ativo", "Rascunho", "Ativo", "Ativo", "Ativo", "Ativo", "Rascunho", "Ativo", "Ativo"]
  return statuses[index % statuses.length] as "Ativo" | "Rascunho" | "Inativo"
}

function getArticlePaidStatus(index: number): "Gratuito" | "Pago" {
  const paidIndices = [1, 4, 7, 10, 13]
  return paidIndices.includes(index) ? "Pago" : "Gratuito"
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Enhanced parameter extraction with mobile defaults
  const page = Math.max(0, parseInt(searchParams.get('page') || '0'))
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10'))) // Limit max page size
  const search = searchParams.get('search') || ''
  const sortBy = searchParams.get('sortBy') || 'date'
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
    // Shorter delay for mobile
    const delay = platform === 'mobile' ? 100 : 300
    await new Promise(resolve => setTimeout(resolve, delay))
    
    // Transform articles data
    const mockArticles: MobileArticle[] = sampleArticles.map((article, index) => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      author: article.author,
      category: article.category,
      status: getArticleStatus(index),
      paid: getArticlePaidStatus(index),
      date: article.date,
      readTime: article.readTime,
      commentCount: article.commentCount || 0,
      // Include optional fields based on platform needs
      ...(includeImages && { imageUrl: article.image }),
      ...(platform === 'web' && { slug: article.slug })
    }))
    
    // Apply search filter
    let filteredArticles = mockArticles
    if (search) {
      filteredArticles = mockArticles.filter(article => 
        article.title.toLowerCase().includes(search.toLowerCase()) ||
        article.author.toLowerCase().includes(search.toLowerCase()) ||
        article.category.toLowerCase().includes(search.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filteredArticles = filteredArticles.filter(article => 
          article[key as keyof MobileArticle]?.toString().toLowerCase() === value.toLowerCase()
        )
      }
    })
    
    // Apply sorting
    filteredArticles.sort((a, b) => {
      const aVal = a[sortBy as keyof MobileArticle] || ''
      const bVal = b[sortBy as keyof MobileArticle] || ''
      
      if (sortOrder === 'desc') {
        return bVal.toString().localeCompare(aVal.toString())
      }
      return aVal.toString().localeCompare(bVal.toString())
    })
    
    // Apply pagination
    const totalCount = filteredArticles.length
    const pageCount = Math.ceil(totalCount / pageSize)
    const paginatedArticles = filteredArticles.slice(page * pageSize, (page + 1) * pageSize)
    
    // Enhanced response with mobile-friendly pagination info
    const response: APIResponse<MobileArticle[]> = {
      success: true,
      data: paginatedArticles,
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
