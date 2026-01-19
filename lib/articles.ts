import { cache } from 'react'
import prisma from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { type Article } from '@/types/blog'

// Type for article with author from Prisma
type BlogArticleWithAuthor = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string | null
  image: string | null
  category: string
  readTime: number
  commentCount: number
  publishedAt: Date | null
  createdAt: Date
  relatedArticleIds: string[]
  author: {
    id: string
    fullName: string | null
    displayName: string | null
    avatar: string | null
  }
}

// Format date in Portuguese
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

// Transform Prisma article to frontend Article type
function transformArticle(article: BlogArticleWithAuthor, includeContent = false): Article {
  const articleDate = article.publishedAt || article.createdAt
  
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt || '',
    ...(includeContent && { content: article.content || '' }),
    image: article.image || '',
    category: article.category,
    author: article.author.fullName || article.author.displayName || 'Unknown',
    authorAvatar: article.author.avatar || '/images/default-avatar.jpg',
    authorSlug: '',
    date: formatDate(new Date(articleDate)),
    readTime: `${article.readTime} min`,
    commentCount: article.commentCount,
  }
}

// Internal function to fetch articles from database
async function fetchArticles(page: number, limit: number, category?: string) {
  const whereCondition: Record<string, unknown> = {
    isPublished: true,
  }
  
  if (category && category !== 'Todos') {
    whereCondition.category = category
  }

  const [articles, totalArticles, allCategories] = await Promise.all([
    prisma.blogArticle.findMany({
      where: whereCondition,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        image: true,
        category: true,
        readTime: true,
        commentCount: true,
        publishedAt: true,
        createdAt: true,
        relatedArticleIds: true,
        author: {
          select: {
            id: true,
            fullName: true,
            displayName: true,
            avatar: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.blogArticle.count({
      where: whereCondition,
    }),
    prisma.blogArticle.findMany({
      where: { isPublished: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    }),
  ])

  const transformedArticles = articles.map((article: BlogArticleWithAuthor) => 
    transformArticle(article)
  )

  const totalPages = Math.ceil(totalArticles / limit)
  const categories = ['Todos', ...allCategories.map((c: { category: string }) => c.category)]

  return {
    articles: transformedArticles,
    pagination: {
      currentPage: page,
      totalPages,
      totalArticles,
      articlesPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    categories,
  }
}

// Get paginated articles with optional category filter (with caching)
// Uses React cache for request memoization + unstable_cache for persistent caching
export const getArticles = cache(async (page: number, limit: number, category?: string) => {
  const getCachedArticles = unstable_cache(
    () => fetchArticles(page, limit, category),
    [`articles-list-${page}-${limit}-${category || 'all'}`],
    {
      revalidate: 1800, // 30 minutes
      tags: ['articles'],
    }
  )
  
  return getCachedArticles()
})

// Internal function to fetch single article
async function fetchArticleBySlug(slug: string) {
  const article = await prisma.blogArticle.findFirst({
    where: { 
      slug,
      isPublished: true,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      image: true,
      category: true,
      readTime: true,
      commentCount: true,
      publishedAt: true,
      createdAt: true,
      relatedArticleIds: true,
      author: {
        select: {
          id: true,
          fullName: true,
          displayName: true,
          avatar: true,
        },
      },
    },
  })

  if (!article) {
    return null
  }

  // Get related articles
  let relatedArticles: BlogArticleWithAuthor[] = []
  
  if (article.relatedArticleIds && article.relatedArticleIds.length > 0) {
    relatedArticles = await prisma.blogArticle.findMany({
      where: {
        id: { in: article.relatedArticleIds },
        isPublished: true,
      },
      take: 3,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        image: true,
        category: true,
        readTime: true,
        commentCount: true,
        publishedAt: true,
        createdAt: true,
        relatedArticleIds: true,
        author: {
          select: {
            id: true,
            fullName: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    })
  }
  
  // Fill with same category articles if needed
  if (relatedArticles.length < 3) {
    const additionalArticles = await prisma.blogArticle.findMany({
      where: {
        category: article.category,
        slug: { not: slug },
        id: { notIn: relatedArticles.map((a) => a.id) },
        isPublished: true,
      },
      take: 3 - relatedArticles.length,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        image: true,
        category: true,
        readTime: true,
        commentCount: true,
        publishedAt: true,
        createdAt: true,
        relatedArticleIds: true,
        author: {
          select: {
            id: true,
            fullName: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    })
    
    relatedArticles = [...relatedArticles, ...additionalArticles]
  }

  return {
    article: transformArticle(article as BlogArticleWithAuthor, true),
    relatedArticles: relatedArticles.map((rel) => transformArticle(rel)),
  }
}

// Get single article by slug with related articles (with caching)
// Uses React cache for request memoization + unstable_cache for persistent caching
export const getArticleBySlug = cache(async (slug: string) => {
  const getCachedArticle = unstable_cache(
    () => fetchArticleBySlug(slug),
    [`article-${slug}`],
    {
      revalidate: 1800, // 30 minutes
      tags: ['articles', `article-${slug}`],
    }
  )
  
  return getCachedArticle()
})

// Internal function to fetch article metadata
async function fetchArticleMetadata(slug: string) {
  const article = await prisma.blogArticle.findFirst({
    where: { 
      slug,
      isPublished: true,
    },
    select: {
      title: true,
      excerpt: true,
      image: true,
      category: true,
      publishedAt: true,
      author: {
        select: {
          fullName: true,
          displayName: true,
        },
      },
    },
  })

  if (!article) {
    return null
  }

  return {
    title: article.title,
    excerpt: article.excerpt,
    image: article.image,
    category: article.category,
    date: article.publishedAt?.toISOString(),
    author: article.author.fullName || article.author.displayName || 'Unknown',
  }
}

// Get article metadata only (for generateMetadata) with caching
// Uses React cache for request memoization + unstable_cache for persistent caching
export const getArticleMetadata = cache(async (slug: string) => {
  const getCachedMetadata = unstable_cache(
    () => fetchArticleMetadata(slug),
    [`article-metadata-${slug}`],
    {
      revalidate: 1800,
      tags: ['articles', `article-${slug}`],
    }
  )
  
  return getCachedMetadata()
})
