import { NextRequest, NextResponse } from 'next/server'
import { sampleArticles } from '@/data/articles'

// Helper function to map article data to table format
function getArticleStatus(index: number): "Ativo" | "Rascunho" | "Inativo" {
  const statuses = ["Ativo", "Ativo", "Ativo", "Rascunho", "Ativo", "Inativo", "Ativo", "Ativo", "Rascunho", "Ativo", "Ativo", "Ativo", "Ativo", "Rascunho", "Ativo", "Ativo"]
  return statuses[index % statuses.length] as "Ativo" | "Rascunho" | "Inativo"
}

function getArticlePaidStatus(index: number): "Gratuito" | "Pago" {
  // Make some articles paid (premium content)
  const paidIndices = [1, 4, 7, 10, 13] // 5 out of 16 articles are paid
  return paidIndices.includes(index) ? "Pago" : "Gratuito"
}

// This is a demo API route showing how to handle server-side data fetching
// You would replace this with your actual database queries

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Extract pagination parameters
  const page = parseInt(searchParams.get('page') || '0')
  const pageSize = parseInt(searchParams.get('pageSize') || '10')
  const search = searchParams.get('search') || ''
  
  // Extract sorting parameters
  const sortBy = searchParams.get('sortBy') || 'id'
  const sortOrder = searchParams.get('sortOrder') || 'asc'
  
  // Extract column filters
  const filters: Record<string, string> = {}
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith('filter_')) {
      const filterKey = key.replace('filter_', '')
      filters[filterKey] = value
    }
  }
  
  try {
    // Simulate database query delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Transform articles data to match table structure
    const mockArticles = sampleArticles.map((article, index) => ({
      id: article.id,
      title: article.title,
      author: article.author,
      category: article.category,
      status: getArticleStatus(index),
      paid: getArticlePaidStatus(index),
      date: article.date,
      readTime: article.readTime,
      commentCount: article.commentCount || 0
    }))
    
    // Apply search filter
    let filteredArticles = mockArticles
    if (search) {
      filteredArticles = mockArticles.filter(article => 
        article.title.toLowerCase().includes(search.toLowerCase()) ||
        article.author.toLowerCase().includes(search.toLowerCase()) ||
        article.category.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filteredArticles = filteredArticles.filter(article => 
          article[key as keyof typeof article]?.toString().toLowerCase() === value.toLowerCase()
        )
      }
    })
    
    // Apply sorting
    filteredArticles.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a] || ''
      const bVal = b[sortBy as keyof typeof b] || ''
      
      if (sortOrder === 'desc') {
        return bVal.toString().localeCompare(aVal.toString())
      }
      return aVal.toString().localeCompare(bVal.toString())
    })
    
    // Apply pagination
    const totalCount = filteredArticles.length
    const pageCount = Math.ceil(totalCount / pageSize)
    const paginatedArticles = filteredArticles.slice(page * pageSize, (page + 1) * pageSize)
    
    return NextResponse.json({
      data: paginatedArticles,
      totalCount,
      pageCount,
      currentPage: page,
      pageSize,
    })
    
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}
