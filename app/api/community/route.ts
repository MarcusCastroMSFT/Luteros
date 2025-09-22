import { NextRequest, NextResponse } from 'next/server'
import { sampleCommunityPosts } from '@/data/community'
import { CommunityPost } from '@/types/community'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const category = searchParams.get('category') || ''

    // Filter community posts based on search, status, and category
    let filteredPosts = sampleCommunityPosts

    if (search) {
      filteredPosts = filteredPosts.filter((item: CommunityPost) =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.content.toLowerCase().includes(search.toLowerCase()) ||
        item.author.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      )
    }

    if (status) {
      filteredPosts = filteredPosts.filter((item: CommunityPost) =>
        item.status.toLowerCase() === status.toLowerCase()
      )
    }

    if (category) {
      filteredPosts = filteredPosts.filter((item: CommunityPost) =>
        item.category.toLowerCase() === category.toLowerCase()
      )
    }

    // Calculate pagination
    const startIndex = page * limit
    const endIndex = startIndex + limit
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex)

    // Map to expected format
    const mappedPosts = paginatedPosts.map((item: CommunityPost) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      author: item.author,
      category: item.category,
      subcategory: item.subcategory,
      status: item.status,
      replies: item.replies,
      likes: item.likes,
      isAnonymous: item.isAnonymous,
      createdDate: item.createdDate,
      lastReply: item.lastReply,
      tags: item.tags
    }))

    const totalItems = filteredPosts.length
    const totalPages = Math.ceil(totalItems / limit)

    // Simulate network delay for demonstration
    await new Promise(resolve => setTimeout(resolve, 100))

    return NextResponse.json({
      data: mappedPosts,
      totalCount: totalItems,
      pageCount: totalPages,
      pagination: {
        page,
        pageSize: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages - 1,
        hasPreviousPage: page > 0
      }
    })
  } catch (error) {
    console.error('Community API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch community posts' },
      { status: 500 }
    )
  }
}
