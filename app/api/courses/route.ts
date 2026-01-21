import { NextRequest, NextResponse, connection } from 'next/server'
import { sampleCourses, type Course } from '@/data/courses'

export async function GET(request: NextRequest) {
  try {
    await connection()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    // Filter courses based on search and status
    let filteredCourses = sampleCourses

    if (search) {
      filteredCourses = filteredCourses.filter((course: Course) =>
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase()) ||
        course.instructor.name.toLowerCase().includes(search.toLowerCase()) ||
        course.category.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (status) {
      filteredCourses = filteredCourses.filter((course: Course) =>
        course.status?.toLowerCase() === status.toLowerCase()
      )
    }

    // Calculate pagination
    const startIndex = page * limit
    const endIndex = startIndex + limit
    const paginatedCourses = filteredCourses.slice(startIndex, endIndex)

    // Map to expected format for the table
    const mappedCourses = paginatedCourses.map((course: Course) => ({
      id: course.id,
      title: course.title,
      instructor: course.instructor.name,
      instructorTitle: course.instructor.title,
      category: course.category,
      level: course.level,
      studentsCount: course.studentsCount,
      rating: course.rating,
      reviewsCount: course.reviewsCount,
      price: course.price,
      originalPrice: course.originalPrice,
      lessonsCount: course.lessonsCount,
      duration: course.duration,
      status: course.status || 'Ativo', // Default to Ativo if not set
      isBestSeller: course.isBestSeller,
      lastUpdated: course.lastUpdated,
      slug: course.slug
    }))

    const totalItems = filteredCourses.length
    const totalPages = Math.ceil(totalItems / limit)

    // Simulate network delay for demonstration
    await new Promise(resolve => setTimeout(resolve, 100))

    return NextResponse.json({
      data: mappedCourses,
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
    console.error('Courses API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}
