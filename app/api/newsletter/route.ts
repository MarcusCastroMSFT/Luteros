import { NextRequest, NextResponse, connection } from 'next/server'
import { sampleNewsletters, type Newsletter } from '@/data/newsletter'

export async function GET(request: NextRequest) {
  try {
    await connection()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    // Filter newsletter based on search and status
    let filteredNewsletter = sampleNewsletters

    if (search) {
      filteredNewsletter = filteredNewsletter.filter((item: Newsletter) =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.subject.toLowerCase().includes(search.toLowerCase()) ||
        item.type.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (status) {
      filteredNewsletter = filteredNewsletter.filter((item: Newsletter) =>
        item.status.toLowerCase() === status.toLowerCase()
      )
    }

    // Calculate pagination
    const startIndex = page * limit
    const endIndex = startIndex + limit
    const paginatedNewsletter = filteredNewsletter.slice(startIndex, endIndex)

    // Map to expected format
    const mappedNewsletter = paginatedNewsletter.map((item: Newsletter) => ({
      id: item.id,
      title: item.title,
      subject: item.subject,
      type: item.type,
      status: item.status,
      createdDate: item.createdDate,
      scheduledDate: item.scheduledDate,
      subscriberCount: item.subscriberCount,
      openRate: item.openRate,
      clickRate: item.clickRate,
      author: item.author,
      template: item.template,
      targetAudience: item.targetAudience
    }))

    const totalItems = filteredNewsletter.length
    const totalPages = Math.ceil(totalItems / limit)

    // Simulate network delay for demonstration
    await new Promise(resolve => setTimeout(resolve, 100))

    return NextResponse.json({
      data: mappedNewsletter,
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
    console.error('Newsletter API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch newsletter' },
      { status: 500 }
    )
  }
}
