import { cacheLife, cacheTag } from 'next/cache'
import { and, asc, desc, eq, inArray, ne, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { blogArticles, users } from '@/lib/db/schema'
import { type Article } from '@/types/blog'

// Format date in Portuguese
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

// Transform DB article to frontend Article type
function transformArticle(article: { id: string; slug: string; title: string; excerpt: string | null; content?: string | null; image: string | null; category: string; readTime: number; commentCount: number; publishedAt: Date | null; createdAt: Date; authorName: string | null; authorDisplayName: string | null; authorAvatar: string | null }, includeContent = false): Article {
  const articleDate = article.publishedAt || article.createdAt
  
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt || '',
    ...(includeContent && { content: article.content || '' }),
    image: article.image || '',
    category: article.category,
    author: article.authorDisplayName || article.authorName || 'Unknown',
    authorAvatar: article.authorAvatar || '/images/default-avatar.jpg',
    authorSlug: '',
    date: formatDate(new Date(articleDate)),
    readTime: `${article.readTime} min`,
    commentCount: article.commentCount,
  }
}

async function fetchArticles(page: number, limit: number, category?: string) {
  const where = and(
    eq(blogArticles.isPublished, true),
    category && category !== 'Todos' ? eq(blogArticles.category, category) : undefined,
  )

  const articleCols = {
    id: blogArticles.id,
    slug: blogArticles.slug,
    title: blogArticles.title,
    excerpt: blogArticles.excerpt,
    image: blogArticles.image,
    category: blogArticles.category,
    readTime: blogArticles.readTime,
    commentCount: blogArticles.commentCount,
    publishedAt: blogArticles.publishedAt,
    createdAt: blogArticles.createdAt,
    relatedArticleIds: blogArticles.relatedArticleIds,
    authorName: users.name,
    authorDisplayName: users.displayName,
    authorAvatar: users.image,
  }

  const [articles, [{ total }], categoriesRaw] = await Promise.all([
    db.select(articleCols).from(blogArticles).innerJoin(users, eq(blogArticles.authorId, users.id)).where(where).orderBy(desc(blogArticles.publishedAt)).offset((page - 1) * limit).limit(limit),
    db.select({ total: sql<number>`count(*)::int` }).from(blogArticles).where(where),
    db.selectDistinct({ category: blogArticles.category }).from(blogArticles).where(eq(blogArticles.isPublished, true)).orderBy(asc(blogArticles.category)),
  ])

  const transformedArticles = articles.map((a) => transformArticle(a))
  const totalArticles = Number(total)
  const totalPages = Math.ceil(totalArticles / limit)
  const categories = ['Todos', ...categoriesRaw.map((c) => c.category)]

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

async function fetchArticleBySlug(slug: string) {
  const articleCols = {
    id: blogArticles.id,
    slug: blogArticles.slug,
    title: blogArticles.title,
    excerpt: blogArticles.excerpt,
    content: blogArticles.content,
    image: blogArticles.image,
    category: blogArticles.category,
    readTime: blogArticles.readTime,
    commentCount: blogArticles.commentCount,
    publishedAt: blogArticles.publishedAt,
    createdAt: blogArticles.createdAt,
    relatedArticleIds: blogArticles.relatedArticleIds,
    authorName: users.name,
    authorDisplayName: users.displayName,
    authorAvatar: users.image,
  }

  const article = await db.select(articleCols).from(blogArticles).innerJoin(users, eq(blogArticles.authorId, users.id)).where(and(eq(blogArticles.slug, slug), eq(blogArticles.isPublished, true))).limit(1).then((r) => r[0] ?? null)
  if (!article) return null

  let relatedArticles = article.relatedArticleIds && article.relatedArticleIds.length > 0
    ? await db.select(articleCols).from(blogArticles).innerJoin(users, eq(blogArticles.authorId, users.id)).where(and(inArray(blogArticles.id, article.relatedArticleIds), eq(blogArticles.isPublished, true))).limit(3)
    : []

  if (relatedArticles.length < 3) {
    const existing = relatedArticles.map((a) => a.id)
    const additional = await db.select(articleCols).from(blogArticles).innerJoin(users, eq(blogArticles.authorId, users.id)).where(and(eq(blogArticles.category, article.category), ne(blogArticles.slug, slug), eq(blogArticles.isPublished, true), existing.length > 0 ? ne(blogArticles.id, existing[0]) : undefined)).orderBy(desc(blogArticles.publishedAt)).limit(3 - relatedArticles.length)
    relatedArticles = [...relatedArticles, ...additional]
  }

  return {
    article: transformArticle(article, true),
    relatedArticles: relatedArticles.map((a) => transformArticle(a)),
  }
}

// Get single article by slug with related articles using Next.js 16 Cache Components
export async function getArticleBySlug(slug: string) {
  'use cache'
  cacheLife('hours')
  cacheTag('articles', `article-${slug}`)
  
  return fetchArticleBySlug(slug)
}

async function fetchArticleMetadata(slug: string) {
  const row = await db
    .select({ title: blogArticles.title, excerpt: blogArticles.excerpt, image: blogArticles.image, category: blogArticles.category, publishedAt: blogArticles.publishedAt, authorName: users.name, authorDisplayName: users.displayName })
    .from(blogArticles)
    .innerJoin(users, eq(blogArticles.authorId, users.id))
    .where(and(eq(blogArticles.slug, slug), eq(blogArticles.isPublished, true)))
    .limit(1)
    .then((r) => r[0] ?? null)

  if (!row) return null

  return {
    title: row.title,
    excerpt: row.excerpt,
    image: row.image,
    category: row.category,
    date: row.publishedAt?.toISOString(),
    author: row.authorDisplayName || row.authorName || 'Unknown',
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
  cacheLife('hours')
  cacheTag('articles', 'article-slugs')
  
  const articles = await db.select({ slug: blogArticles.slug }).from(blogArticles).where(eq(blogArticles.isPublished, true))
  return articles.map((a) => a.slug)
}

// Get initial articles for SSR (first page)
export async function getInitialArticles() {
  'use cache'
  cacheLife('minutes') // Shorter cache for listing - new articles appear within minutes
  cacheTag('articles', 'articles-initial')
  
  return fetchArticles(1, 12) // First page with 12 articles
}
