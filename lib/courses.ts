import { cacheLife, cacheTag } from 'next/cache'
import { and, asc, desc, eq, inArray, ne, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { db } from '@/lib/db'
import { courses, lessons, users } from '@/lib/db/schema'

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

// Transform DB course row to frontend Course type
function transformCourse(course: { id: string; slug: string; title: string; description: string; shortDescription: string | null; level: string; category: string; language: string; duration: number | null; thumbnail: string | null; coverImage: string | null; previewVideo: string | null; price: string | null; discountPrice: string | null; isFree: boolean; isPublished: boolean; publishedAt: Date | null; enrollmentCount: number; averageRating: string | null; reviewCount: number; createdAt: Date; updatedAt: Date; instructorId: string; instructorName: string | null; instructorDisplayName: string | null; instructorAvatar: string | null; instructorBio: string | null; lessonsCount: number }): Course {
  const price = course.price ? parseFloat(course.price.toString()) : 0
  const discountPrice = course.discountPrice ? parseFloat(course.discountPrice.toString()) : null
  const rating = course.averageRating ? parseFloat(course.averageRating.toString()) : 0
  
  let status: 'Ativo' | 'Rascunho' | 'Inativo' = 'Rascunho'
  if (course.isPublished) status = 'Ativo'
  
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
      id: course.instructorId,
      name: course.instructorDisplayName || course.instructorName || 'Unknown',
      slug: course.instructorId,
      title: '',
      bio: course.instructorBio || '',
      image: course.instructorAvatar || '/images/default-avatar.jpg',
      rating: 0,
      reviewsCount: 0,
      studentsCount: 0,
      coursesCount: 0,
    },
    price: discountPrice !== null ? discountPrice : price,
    originalPrice: discountPrice !== null ? price : null,
    isFree: course.isFree,
    lessonsCount: course.lessonsCount,
    sectionsCount: 0,
    duration: formatDuration(course.duration),
    rating,
    reviewsCount: course.reviewCount,
    studentsCount: course.enrollmentCount,
    level: course.level as 'Iniciante' | 'Intermediário' | 'Avançado',
    category: course.category,
    status,
    isBestSeller,
    tags: [],
    language: course.language,
    lastUpdated: formatDate(course.updatedAt),
    publishedAt: course.publishedAt ? course.publishedAt.toISOString() : null,
  }
}

async function fetchCourses(page: number, limit: number, category?: string) {
  const instructor = alias(users, 'instructor')
  const where = and(
    eq(courses.isPublished, true),
    category && category !== 'Todos' ? eq(courses.category, category) : undefined,
  )

  const courseCols = {
    id: courses.id, slug: courses.slug, title: courses.title, description: courses.description,
    shortDescription: courses.shortDescription, level: courses.level, category: courses.category,
    language: courses.language, duration: courses.duration, thumbnail: courses.thumbnail,
    coverImage: courses.coverImage, previewVideo: courses.previewVideo, price: courses.price,
    discountPrice: courses.discountPrice, isFree: courses.isFree, isPublished: courses.isPublished,
    publishedAt: courses.publishedAt, enrollmentCount: courses.enrollmentCount,
    averageRating: courses.averageRating, reviewCount: courses.reviewCount,
    createdAt: courses.createdAt, updatedAt: courses.updatedAt,
    instructorId: instructor.id, instructorName: instructor.name,
    instructorDisplayName: instructor.displayName, instructorAvatar: instructor.image,
    instructorBio: instructor.bio,
  }

  const [rows, [{ total }], categoriesRaw] = await Promise.all([
    db.select(courseCols).from(courses).innerJoin(instructor, eq(courses.instructorId, instructor.id)).where(where).orderBy(desc(courses.enrollmentCount), desc(courses.averageRating)).offset((page - 1) * limit).limit(limit),
    db.select({ total: sql<number>`count(*)::int` }).from(courses).where(where),
    db.selectDistinct({ category: courses.category }).from(courses).where(eq(courses.isPublished, true)).orderBy(asc(courses.category)),
  ])

  // Batch lesson counts for all courses on this page in one query (avoids correlated subquery per row)
  const courseIds = rows.map((r) => r.id)
  const lessonCounts = courseIds.length > 0
    ? await db
        .select({ courseId: lessons.courseId, count: sql<number>`count(*)::int` })
        .from(lessons)
        .where(and(inArray(lessons.courseId, courseIds), eq(lessons.isPublished, true)))
        .groupBy(lessons.courseId)
    : []
  const lessonCountMap = new Map(lessonCounts.map((c) => [c.courseId, c.count]))

  const transformedCourses = rows.map((r) => transformCourse({ ...r, lessonsCount: lessonCountMap.get(r.id) ?? 0 }))
  const totalCourses = Number(total)
  const totalPages = Math.ceil(totalCourses / limit)
  const categories = ['Todos', ...categoriesRaw.map((c) => c.category)]

  return {
    courses: transformedCourses,
    pagination: { currentPage: page, totalPages, totalCourses, coursesPerPage: limit, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
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

async function fetchCourseBySlug(slug: string) {
  const instructor = alias(users, 'instructor')
  const courseCols = {
    id: courses.id, slug: courses.slug, title: courses.title, description: courses.description,
    shortDescription: courses.shortDescription, level: courses.level, category: courses.category,
    language: courses.language, duration: courses.duration, thumbnail: courses.thumbnail,
    coverImage: courses.coverImage, previewVideo: courses.previewVideo, price: courses.price,
    discountPrice: courses.discountPrice, isFree: courses.isFree, isPublished: courses.isPublished,
    publishedAt: courses.publishedAt, enrollmentCount: courses.enrollmentCount,
    averageRating: courses.averageRating, reviewCount: courses.reviewCount,
    createdAt: courses.createdAt, updatedAt: courses.updatedAt,
    instructorId: instructor.id, instructorName: instructor.name,
    instructorDisplayName: instructor.displayName, instructorAvatar: instructor.image,
    instructorBio: instructor.bio,
  }

  const course = await db.select(courseCols).from(courses).innerJoin(instructor, eq(courses.instructorId, instructor.id)).where(and(eq(courses.slug, slug), eq(courses.isPublished, true))).limit(1).then((r) => r[0] ?? null)
  if (!course) return null

  const [courseLessons, related] = await Promise.all([
    db.select({ id: lessons.id, title: lessons.title, description: lessons.description, duration: lessons.duration, order: lessons.order, sectionTitle: lessons.sectionTitle, isFree: lessons.isFree, type: lessons.type }).from(lessons).where(and(eq(lessons.courseId, course.id), eq(lessons.isPublished, true))).orderBy(asc(lessons.order)),
    db.select(courseCols).from(courses).innerJoin(instructor, eq(courses.instructorId, instructor.id)).where(and(eq(courses.category, course.category), ne(courses.slug, slug), eq(courses.isPublished, true))).orderBy(desc(courses.enrollmentCount)).limit(3),
  ])

  // Batch lesson counts for related courses; main course's count is courseLessons.length
  const relatedIds = related.map((r) => r.id)
  const relatedLessonCounts = relatedIds.length > 0
    ? await db
        .select({ courseId: lessons.courseId, count: sql<number>`count(*)::int` })
        .from(lessons)
        .where(and(inArray(lessons.courseId, relatedIds), eq(lessons.isPublished, true)))
        .groupBy(lessons.courseId)
    : []
  const relatedLessonCountMap = new Map(relatedLessonCounts.map((c) => [c.courseId, c.count]))

  return {
    course: transformCourse({ ...course, lessonsCount: courseLessons.length }),
    lessons: courseLessons,
    relatedCourses: related.map((r) => transformCourse({ ...r, lessonsCount: relatedLessonCountMap.get(r.id) ?? 0 })),
  }
}

// Get single course by slug with related courses using Next.js 16 Cache Components
export async function getCourseBySlug(slug: string) {
  'use cache'
  cacheLife('hours')
  cacheTag('courses', `course-${slug}`)
  
  return fetchCourseBySlug(slug)
}

async function fetchCourseMetadata(slug: string) {
  const instructor = alias(users, 'instructor')
  const row = await db
    .select({ title: courses.title, description: courses.description, shortDescription: courses.shortDescription, thumbnail: courses.thumbnail, category: courses.category, level: courses.level, publishedAt: courses.publishedAt, instructorName: instructor.name, instructorDisplayName: instructor.displayName })
    .from(courses)
    .innerJoin(instructor, eq(courses.instructorId, instructor.id))
    .where(and(eq(courses.slug, slug), eq(courses.isPublished, true)))
    .limit(1)
    .then((r) => r[0] ?? null)

  if (!row) return null

  return {
    title: row.title,
    description: row.shortDescription || row.description,
    image: row.thumbnail,
    category: row.category,
    level: row.level || 'Iniciante',
    date: row.publishedAt?.toISOString(),
    instructorName: row.instructorDisplayName || row.instructorName || 'lutteros',
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
  
  const rows = await db.select({ slug: courses.slug }).from(courses).where(eq(courses.isPublished, true))
  const slugs = rows.map((c) => c.slug)
  if (slugs.length === 0) return ['_placeholder']
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
  const [rows] = await db.select({
    total: sql<number>`count(*)::int`,
    published: sql<number>`count(*) filter (where ${courses.isPublished} = true)::int`,
    totalEnrollments: sql<number>`coalesce(sum(${courses.enrollmentCount}), 0)::int`,
    avgRating: sql<number>`avg(case when ${courses.isPublished} then ${courses.averageRating}::float else null end)`,
  }).from(courses)

  const totalCourses = Number(rows.total)
  const publishedCourses = Number(rows.published)

  return {
    totalCourses,
    publishedCourses,
    draftCourses: totalCourses - publishedCourses,
    totalEnrollments: Number(rows.totalEnrollments),
    averageRating: rows.avgRating ? parseFloat(String(rows.avgRating)) : 0,
  }
}

// Get course stats with caching
export async function getCourseStats() {
  'use cache'
  cacheLife('minutes')
  cacheTag('courses', 'courses-stats')
  
  return fetchCourseStats()
}
