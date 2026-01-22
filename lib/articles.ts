import { cacheLife, cacheTag } from 'next/cache'
import prisma from '@/lib/prisma'
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
  user_profiles: {
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
    author: article.user_profiles.fullName || article.user_profiles.displayName || 'Unknown',
    authorAvatar: article.user_profiles.avatar || '/images/default-avatar.jpg',
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
    prisma.blog_articles.findMany({
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
        user_profiles: {
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
    prisma.blog_articles.count({
      where: whereCondition,
    }),
    prisma.blog_articles.findMany({
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

// Get paginated articles with optional category filter using Next.js 16 Cache Components
export async function getArticles(page: number, limit: number, category?: string) {
  'use cache'
  cacheLife('hours') // Articles change less frequently - stale 1h, revalidate 1h, expire 1d
  cacheTag('articles', `articles-list-${page}-${limit}-${category || 'all'}`)
  
  return fetchArticles(page, limit, category)
}

// Internal function to fetch single article
async function fetchArticleBySlug(slug: string) {
  const article = await prisma.blog_articles.findFirst({
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
      user_profiles: {
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
    relatedArticles = await prisma.blog_articles.findMany({
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
        user_profiles: {
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
    const additionalArticles = await prisma.blog_articles.findMany({
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
        user_profiles: {
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

// Get single article by slug with related articles using Next.js 16 Cache Components
export async function getArticleBySlug(slug: string) {
  'use cache'
  cacheLife('hours')
  cacheTag('articles', `article-${slug}`)
  
  return fetchArticleBySlug(slug)
}

// Internal function to fetch article metadata
async function fetchArticleMetadata(slug: string) {
  const article = await prisma.blog_articles.findFirst({
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
      user_profiles: {
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
    author: article.user_profiles.fullName || article.user_profiles.displayName || 'Unknown',
  }
}

// Get article metadata only (for generateMetadata) using Next.js 16 Cache Components
export async function getArticleMetadata(slug: string) {
  'use cache'
  cacheLife('hours')
  cacheTag('articles', `article-${slug}`)
  
  return fetchArticleMetadata(slug)
}

// Get all article slugs for generateStaticParams
export async function getAllArticleSlugs(): Promise<string[]> {
  'use cache'
  cacheLife('hours') // Cache slugs longer as they change less frequently
  cacheTag('articles', 'article-slugs')
  
  const articles = await prisma.blog_articles.findMany({
    where: { isPublished: true },
    select: { slug: true },
  })
  
  return articles.map((a: { slug: string }) => a.slug)
}

// Get initial articles for SSR (first page)
export async function getInitialArticles() {
  'use cache'
  cacheLife('minutes') // Shorter cache for listing - new articles appear within minutes
  cacheTag('articles', 'articles-initial')
  
  return fetchArticles(1, 12) // First page with 12 articles
}
