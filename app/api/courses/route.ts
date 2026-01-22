import { NextRequest, NextResponse, connection } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAdminOrInstructor } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    await connection()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const pageSize = parseInt(searchParams.get('pageSize') || searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    
    // Extract sorting parameters
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    // Verify authentication and authorization (admin or instructor only)
    const authResult = await requireAdminOrInstructor(request)
    if (authResult instanceof NextResponse) {
      return authResult // Return 401/403 response
    }

    // Build where condition for Prisma query
    const whereCondition: Record<string, unknown> = {}

    // Apply search filter
    if (search) {
      whereCondition.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { user_profiles: { fullName: { contains: search, mode: 'insensitive' } } },
      ]
    }

    // Apply status filter
    if (status) {
      if (status.toLowerCase() === 'ativo') {
        whereCondition.isPublished = true
      } else if (status.toLowerCase() === 'rascunho') {
        whereCondition.isPublished = false
      }
    }

    // Build orderBy condition
    const orderByMap: Record<string, Record<string, unknown>> = {
      title: { title: sortOrder },
      instructor: { user_profiles: { fullName: sortOrder } },
      category: { category: sortOrder },
      level: { level: sortOrder },
      rating: { averageRating: sortOrder },
      studentsCount: { enrollmentCount: sortOrder },
      price: { price: sortOrder },
      createdAt: { createdAt: sortOrder },
    }
    
    const orderBy = orderByMap[sortBy] || { createdAt: sortOrder }

    // Execute queries in parallel for performance
    const [courses, totalCount] = await Promise.all([
      prisma.courses.findMany({
        where: whereCondition,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          shortDescription: true,
          thumbnail: true,
          category: true,
          level: true,
          duration: true,
          price: true,
          discountPrice: true,
          isFree: true,
          isPublished: true,
          publishedAt: true,
          enrollmentCount: true,
          averageRating: true,
          reviewCount: true,
          createdAt: true,
          updatedAt: true,
          user_profiles: {
            select: {
              id: true,
              fullName: true,
              displayName: true,
              avatar: true,
              bio: true,
            }
          },
          _count: {
            select: {
              lessons: true,
            },
          },
        },
        orderBy,
        skip: page * pageSize,
        take: pageSize,
      }),
      prisma.courses.count({
        where: whereCondition,
      }),
    ])

    // Define the type for courses from Prisma query
    type CourseWithInstructor = {
      id: string
      title: string
      slug: string
      description: string
      shortDescription: string | null
      thumbnail: string | null
      category: string
      level: string
      duration: number | null
      price: { toString(): string } | null
      discountPrice: { toString(): string } | null
      isFree: boolean
      isPublished: boolean
      publishedAt: Date | null
      enrollmentCount: number
      averageRating: { toString(): string } | null
      reviewCount: number
      createdAt: Date
      updatedAt: Date
      user_profiles: {
        id: string
        fullName: string | null
        displayName: string | null
        avatar: string | null
        bio: string | null
      }
      _count: {
        lessons: number
      }
    }

    // Format duration from minutes to readable string
    const formatDuration = (minutes: number | null): string => {
      if (!minutes) return '0h'
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      if (hours === 0) return `${mins}min`
      if (mins === 0) return `${hours}h`
      return `${hours}h ${mins}min`
    }

    // Map level from database format to Portuguese
    const levelDisplayMap: Record<string, string> = {
      'BEGINNER': 'Iniciante',
      'INTERMEDIATE': 'Intermediário',
      'ADVANCED': 'Avançado',
    }

    // Transform data to match frontend interface
    const transformedCourses = courses.map((course: CourseWithInstructor) => {
      const price = course.price ? parseFloat(course.price.toString()) : 0
      const discountPrice = course.discountPrice ? parseFloat(course.discountPrice.toString()) : null
      const rating = course.averageRating ? parseFloat(course.averageRating.toString()) : 0
      
      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        instructor: course.user_profiles.fullName || course.user_profiles.displayName || 'Unknown',
        instructorId: course.user_profiles.id,
        instructorTitle: '', // Could be populated from profile if needed
        category: course.category,
        level: levelDisplayMap[course.level] || course.level,
        studentsCount: course.enrollmentCount,
        rating,
        reviewsCount: course.reviewCount,
        price: discountPrice !== null ? discountPrice : price,
        originalPrice: discountPrice !== null ? price : undefined,
        lessonsCount: course._count.lessons,
        duration: formatDuration(course.duration),
        status: course.isPublished ? 'Ativo' : 'Rascunho',
        isBestSeller: course.enrollmentCount > 1000,
        lastUpdated: course.updatedAt.toISOString(),
      }
    })

    const pageCount = Math.ceil(totalCount / pageSize)

    return NextResponse.json({
      data: transformedCourses,
      totalCount,
      pageCount,
      page,
      pageSize,
    })
  } catch (error) {
    console.error('Courses API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication and authorization (admin or instructor only)
    const authResult = await requireAdminOrInstructor(request)
    if (authResult instanceof NextResponse) {
      return authResult // Return 401/403 response
    }

    // Parse request body
    const body = await request.json()
    const { 
      title, 
      slug, 
      description, 
      shortDescription,
      level,
      category,
      language = 'pt-BR',
      duration,
      thumbnail,
      coverImage,
      previewVideo,
      price,
      discountPrice,
      isFree = false,
      isPublished = false,
      instructorId,
    } = body

    // Validation
    if (!title || !slug || !description || !level || !category) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    // Valid levels
    const validLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'Iniciante', 'Intermediário', 'Avançado']
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { success: false, error: 'Nível inválido' },
        { status: 400 }
      )
    }

    // Map Portuguese levels to database format
    const levelMap: Record<string, string> = {
      'Iniciante': 'BEGINNER',
      'Intermediário': 'INTERMEDIATE', 
      'Avançado': 'ADVANCED',
    }
    const dbLevel = levelMap[level] || level

    // Use provided instructorId or default to the authenticated user
    const finalInstructorId = instructorId || authResult.user.id

    // Check if slug already exists
    const existingCourse = await prisma.courses.findUnique({
      where: { slug }
    })

    if (existingCourse) {
      return NextResponse.json(
        { success: false, error: 'Já existe um curso com esse slug' },
        { status: 400 }
      )
    }

    // Create course
    const course = await prisma.courses.create({
      data: {
        title,
        slug,
        description,
        shortDescription: shortDescription || null,
        level: dbLevel,
        category,
        language,
        duration: duration || null,
        thumbnail: thumbnail || null,
        coverImage: coverImage || null,
        previewVideo: previewVideo || null,
        price: price ? parseFloat(price) : null,
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        isFree,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
        instructorId: finalInstructorId,
        enrollmentCount: 0,
        reviewCount: 0,
      },
      include: {
        user_profiles: {
          select: {
            id: true,
            fullName: true,
            displayName: true,
            avatar: true,
          }
        }
      }
    })

    // Invalidate cache so users see the new course immediately
    revalidatePath('/courses')
    revalidatePath(`/courses/${slug}`)
    revalidateTag('courses', {})
    revalidateTag('courses-initial', {})
    revalidateTag('course-slugs', {})
    revalidateTag(`course-${slug}`, {})
    revalidateTag('courses-stats', {})

    return NextResponse.json({
      success: true,
      data: course,
    })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao criar curso' },
      { status: 500 }
    )
  }
}
