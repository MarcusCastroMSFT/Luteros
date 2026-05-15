import { NextRequest, NextResponse } from 'next/server'
import { getArticles } from '@/lib/articles'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')))
  const category = searchParams.get('category') || undefined
  const search = searchParams.get('search') || undefined

  try {
    const data = await getArticles(page, limit, category, search)

    return NextResponse.json({
      success: true,
      data: {
        articles: data.articles,
        pagination: data.pagination,
        categories: data.categories,
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
