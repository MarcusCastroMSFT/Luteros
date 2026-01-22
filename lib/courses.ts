import { cacheLife, cacheTag } from 'next/cache'
import prisma from '@/lib/prisma'

// Type for course with instructor from Prisma
type CourseWithInstructor = {
  id: string
  slug: string
  title: string
  description: string
  shortDescription: string | null
  level: string
  category: string
  language: string
  duration: number | null
  thumbnail: string | null
  coverImage: string | null
  previewVideo: string | null
  price: { toString(): string } | null // Decimal type
  discountPrice: { toString(): string } | null // Decimal type
  isFree: boolean
  isPublished: boolean
  publishedAt: Date | null
  enrollmentCount: number
  averageRating: { toString(): string } | null // Decimal type
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
  _count?: {
    lessons: number
  }
}

// Frontend Course type
export type Course = {
  id: string
  slug: string
  title: string
  description: string
  shortDescription: string
  image: string
  coverImage: string
  previewVideo: string
  instructor: {
    id: string
    name: string
    slug: string
    title: string
    bio: string
    image: string
    rating: number
    reviewsCount: number
    studentsCount: number
    coursesCount: number
  }
  price: number
  originalPrice: number | null
  isFree: boolean
  lessonsCount: number
  sectionsCount: number
  duration: string
  rating: number
  reviewsCount: number
  studentsCount: number
  level: 'Iniciante' | 'Intermediário' | 'Avançado'
  category: string
  status: 'Ativo' | 'Rascunho' | 'Inativo'
  isBestSeller: boolean
  tags: string[]
  language: string
  lastUpdated: string
  publishedAt: string | null
}

export type CoursesPagination = {
  currentPage: number
  totalPages: number
  totalCourses: number
  coursesPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// Format duration from minutes to readable string
function formatDuration(minutes: number | null): string {
  if (!minutes) return '0h'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}min`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

// Format date in Portuguese
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

// Transform Prisma course to frontend Course type
function transformCourse(course: CourseWithInstructor): Course {
  const price = course.price ? parseFloat(course.price.toString()) : 0
  const discountPrice = course.discountPrice ? parseFloat(course.discountPrice.toString()) : null
  const rating = course.averageRating ? parseFloat(course.averageRating.toString()) : 0
  
  // Determine status based on isPublished
  let status: 'Ativo' | 'Rascunho' | 'Inativo' = 'Rascunho'
  if (course.isPublished) {
    status = 'Ativo'
  }
  
  // Determine if course is a best seller (more than 1000 enrollments)
  const isBestSeller = course.enrollmentCount > 1000
  
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    shortDescription: course.shortDescription || '',
    image: course.thumbnail || '',
    coverImage: course.coverImage || '',
    previewVideo: course.previewVideo || '',
    instructor: {
      id: course.user_profiles.id,
      name: course.user_profiles.fullName || course.user_profiles.displayName || 'Unknown',
      slug: course.user_profiles.id, // Using ID as slug for now
      title: '', // Will be populated from separate query if needed
      bio: course.user_profiles.bio || '',
      image: course.user_profiles.avatar || '/images/default-avatar.jpg',
      rating: 0, // Will be calculated from instructor's courses
      reviewsCount: 0,
      studentsCount: 0,
      coursesCount: 0,
    },
    price: discountPrice !== null ? discountPrice : price,
    originalPrice: discountPrice !== null ? price : null,
    isFree: course.isFree,
    lessonsCount: course._count?.lessons || 0,
    sectionsCount: 0, // Sections are derived from lessons
    duration: formatDuration(course.duration),
    rating,
    reviewsCount: course.reviewCount,
    studentsCount: course.enrollmentCount,
    level: course.level as 'Iniciante' | 'Intermediário' | 'Avançado',
    category: course.category,
    status,
    isBestSeller,
    tags: [], // Will be populated from separate table if needed
    language: course.language,
    lastUpdated: formatDate(course.updatedAt),
    publishedAt: course.publishedAt ? course.publishedAt.toISOString() : null,
  }
}

// Internal function to fetch courses from database
async function fetchCourses(page: number, limit: number, category?: string) {
  const whereCondition: Record<string, unknown> = {
    isPublished: true,
  }
  
  if (category && category !== 'Todos') {
    whereCondition.category = category
  }

  const [courses, totalCourses, allCategories] = await Promise.all([
    prisma.courses.findMany({
      where: whereCondition,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        shortDescription: true,
        level: true,
        category: true,
        language: true,
        duration: true,
        thumbnail: true,
        coverImage: true,
        previewVideo: true,
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
          },
        },
        _count: {
          select: {
            lessons: true,
          },
        },
      },
      orderBy: [
        { enrollmentCount: 'desc' },
        { averageRating: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.courses.count({
      where: whereCondition,
    }),
    prisma.courses.findMany({
      where: { isPublished: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    }),
  ])

  const transformedCourses = courses.map((course: CourseWithInstructor) => 
    transformCourse(course)
  )

  const totalPages = Math.ceil(totalCourses / limit)
  const categories = ['Todos', ...allCategories.map((c: { category: string }) => c.category)]

  return {
    courses: transformedCourses,
    pagination: {
      currentPage: page,
      totalPages,
      totalCourses,
      coursesPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    categories,
  }
}

// Get paginated courses with optional category filter using Next.js 16 Cache Components
export async function getCourses(page: number, limit: number, category?: string) {
  'use cache'
  cacheLife('hours') // Courses change less frequently
  cacheTag('courses', `courses-list-${page}-${limit}-${category || 'all'}`)
  
  return fetchCourses(page, limit, category)
}

// Internal function to fetch single course
async function fetchCourseBySlug(slug: string) {
  const course = await prisma.courses.findFirst({
    where: { 
      slug,
      isPublished: true,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      shortDescription: true,
      level: true,
      category: true,
      language: true,
      duration: true,
      thumbnail: true,
      coverImage: true,
      previewVideo: true,
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
        },
      },
      _count: {
        select: {
          lessons: true,
        },
      },
      lessons: {
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          description: true,
          duration: true,
          order: true,
          sectionTitle: true,
          isFree: true,
          type: true,
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!course) {
    return null
  }

  // Get related courses (same category)
  const relatedCourses = await prisma.courses.findMany({
    where: {
      category: course.category,
      slug: { not: slug },
      isPublished: true,
    },
    take: 3,
    orderBy: { enrollmentCount: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      shortDescription: true,
      level: true,
      category: true,
      language: true,
      duration: true,
      thumbnail: true,
      coverImage: true,
      previewVideo: true,
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
        },
      },
      _count: {
        select: {
          lessons: true,
        },
      },
    },
  })

  return {
    course: transformCourse(course as CourseWithInstructor),
    lessons: course.lessons,
    relatedCourses: relatedCourses.map((c: CourseWithInstructor) => transformCourse(c)),
  }
}

// Get single course by slug with related courses using Next.js 16 Cache Components
export async function getCourseBySlug(slug: string) {
  'use cache'
  cacheLife('hours')
  cacheTag('courses', `course-${slug}`)
  
  return fetchCourseBySlug(slug)
}

// Internal function to fetch course metadata
async function fetchCourseMetadata(slug: string) {
  const course = await prisma.courses.findFirst({
    where: { 
      slug,
      isPublished: true,
    },
    select: {
      title: true,
      description: true,
      shortDescription: true,
      thumbnail: true,
      category: true,
      level: true,
      publishedAt: true,
      user_profiles: {
        select: {
          fullName: true,
          displayName: true,
        },
      },
    },
  })

  if (!course) {
    return null
  }

  return {
    title: course.title,
    description: course.shortDescription || course.description,
    image: course.thumbnail,
    category: course.category,
    level: course.level || 'Iniciante',
    date: course.publishedAt?.toISOString(),
    instructorName: course.user_profiles.fullName || course.user_profiles.displayName || 'Luteros',
  }
}

// Get course metadata only (for generateMetadata) using Next.js 16 Cache Components
export async function getCourseMetadata(slug: string) {
  'use cache'
  cacheLife('hours')
  cacheTag('courses', `course-${slug}`)
  
  return fetchCourseMetadata(slug)
}

// Get all course slugs for generateStaticParams
export async function getAllCourseSlugs(): Promise<string[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('courses', 'course-slugs')
  
  const courses = await prisma.courses.findMany({
    where: { isPublished: true },
    select: { slug: true },
  })
  
  const slugs = courses.map((c: { slug: string }) => c.slug)
  
  // If no courses exist, return a placeholder slug for build validation
  // The actual page will return 404 for non-existent courses
  if (slugs.length === 0) {
    return ['_placeholder']
  }
  
  return slugs
}

// Get initial courses for SSR (first page)
export async function getInitialCourses() {
  'use cache'
  cacheLife('minutes') // Shorter cache for listing - new courses appear within minutes
  cacheTag('courses', 'courses-initial')
  
  return fetchCourses(1, 12) // First page with 12 courses
}

// Get course stats for dashboard
async function fetchCourseStats() {
  const [totalCourses, publishedCourses, totalEnrollments, avgRating] = await Promise.all([
    prisma.courses.count(),
    prisma.courses.count({ where: { isPublished: true } }),
    prisma.courses.aggregate({
      _sum: { enrollmentCount: true },
    }),
    prisma.courses.aggregate({
      _avg: { averageRating: true },
      where: { isPublished: true },
    }),
  ])

  return {
    totalCourses,
    publishedCourses,
    draftCourses: totalCourses - publishedCourses,
    totalEnrollments: totalEnrollments._sum.enrollmentCount || 0,
    averageRating: avgRating._avg.averageRating 
      ? parseFloat(avgRating._avg.averageRating.toString()) 
      : 0,
  }
}

// Get course stats with caching
export async function getCourseStats() {
  'use cache'
  cacheLife('minutes')
  cacheTag('courses', 'courses-stats')
  
  return fetchCourseStats()
}
