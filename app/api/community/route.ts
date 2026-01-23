import { NextRequest, NextResponse, connection } from 'next/server'
import { getCommunityPosts } from '@/lib/community'

export async function GET(request: NextRequest) {
  try {
    await connection()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || undefined
    const status = searchParams.get('status') || searchParams.get('filter_status') || undefined
    const category = searchParams.get('category') || searchParams.get('filter_category') || undefined
    const isReported = searchParams.get('isReported') || searchParams.get('filter_isReported') || undefined

    const result = await getCommunityPosts(page, limit, category, search, status, isReported)

    return NextResponse.json({
      data: result.posts,
      totalCount: result.totalCount,
      pageCount: result.pageCount,
      pagination: result.pagination,
      categories: result.categories,
    })
  } catch (error) {
    console.error('Community API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch community posts' },
      { status: 500 }
    )
  }
}
