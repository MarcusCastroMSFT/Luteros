import { cacheLife, cacheTag } from 'next/cache'
import { and, asc, desc, eq, ilike, inArray, ne, or, sql } from 'drizzle-orm'
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
function transformArticle(article: { id: string; slug: string; title: string; excerpt: string | null; content?: string | null; references?: string | null; image: string | null; category: string; readTime: number; commentCount: number; publishedAt: Date | null; createdAt: Date; updatedAt: Date; authorName: string | null; authorDisplayName: string | null; authorAvatar: string | null; accessType?: string; targetAudience?: string; metaTitle?: string | null; metaDescription?: string | null; tags?: string[] }, includeContent = false): Article {
  const articleDate = article.publishedAt || article.createdAt

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt || '',
    ...(includeContent && { content: article.content || '' }),
    ...(includeContent && { references: article.references || null }),
    image: article.image || '',
    category: article.category,
    author: article.authorDisplayName || article.authorName || 'Unknown',
    authorAvatar: article.authorAvatar || '/images/default-avatar.svg',
    authorSlug: '',
    date: formatDate(new Date(articleDate)),
    dateISO: articleDate.toISOString(),
    updatedAtISO: article.updatedAt.toISOString(),
    readTime: `${article.readTime} min`,
    commentCount: article.commentCount,
    accessType: (article.accessType === 'paid' ? 'paid' : 'free'),
    targetAudience: (article.targetAudience === 'doctors' ? 'doctors' : 'general'),
    metaTitle: article.metaTitle ?? null,
    metaDescription: article.metaDescription ?? null,
    tags: article.tags ?? [],
  }
}

async function fetchArticles(page: number, limit: number, category?: string, search?: string) {
  const where = and(
    eq(blogArticles.isPublished, true),
    category && category !== 'Todos' ? eq(blogArticles.category, category) : undefined,
    search
      ? or(
          ilike(blogArticles.title, `%${search}%`),
          ilike(blogArticles.excerpt, `%${search}%`),
        )
      : undefined,
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
    updatedAt: blogArticles.updatedAt,
    relatedArticleIds: blogArticles.relatedArticleIds,
    accessType: blogArticles.accessType,
    targetAudience: blogArticles.targetAudience,
    metaTitle: blogArticles.metaTitle,
    metaDescription: blogArticles.metaDescription,
    tags: blogArticles.tags,
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

// Cached path (no search) — single tag so revalidateTag('articles') covers all pages
async function getArticlesCached(page: number, limit: number, category?: string) {
  'use cache'
  cacheLife('hours') // Articles change less frequently - stale 1h, revalidate 1h, expire 1d
  cacheTag('articles')

  return fetchArticles(page, limit, category)
}

// Get paginated articles with optional category filter. Searches bypass the cache
// (cardinality of free-text would explode cache entries).
export async function getArticles(page: number, limit: number, category?: string, search?: string) {
  if (search) {
    return fetchArticles(page, limit, category, search)
  }
  return getArticlesCached(page, limit, category)
}

async function fetchArticleBySlug(slug: string) {
  const articleCols = {
    id: blogArticles.id,
    slug: blogArticles.slug,
    title: blogArticles.title,
    excerpt: blogArticles.excerpt,
    content: blogArticles.content,
    references: blogArticles.references,
    image: blogArticles.image,
    category: blogArticles.category,
    readTime: blogArticles.readTime,
    commentCount: blogArticles.commentCount,
    publishedAt: blogArticles.publishedAt,
    createdAt: blogArticles.createdAt,
    updatedAt: blogArticles.updatedAt,
    relatedArticleIds: blogArticles.relatedArticleIds,
    accessType: blogArticles.accessType,
    targetAudience: blogArticles.targetAudience,
    metaTitle: blogArticles.metaTitle,
    metaDescription: blogArticles.metaDescription,
    tags: blogArticles.tags,
    authorName: users.name,
    authorDisplayName: users.displayName,
    authorAvatar: users.image,
  }

  const article = await db.select(articleCols).from(blogArticles).innerJoin(users, eq(blogArticles.authorId, users.id)).where(and(eq(blogArticles.slug, slug), eq(blogArticles.isPublished, true))).limit(1).then((r) => r[0] ?? null)
  if (!article) return null

  // Fetch explicit related + category fallback in parallel, then merge and trim to 3.
  // Avoids the prior 1-then-1-conditionally pattern (up to 3 sequential round-trips).
  const explicitIds = article.relatedArticleIds ?? []
  const [explicitRelated, categoryFallback] = await Promise.all([
    explicitIds.length > 0
      ? db.select(articleCols).from(blogArticles).innerJoin(users, eq(blogArticles.authorId, users.id)).where(and(inArray(blogArticles.id, explicitIds), eq(blogArticles.isPublished, true))).limit(3)
      : Promise.resolve([] as Array<typeof article>),
    db.select(articleCols).from(blogArticles).innerJoin(users, eq(blogArticles.authorId, users.id)).where(and(eq(blogArticles.category, article.category), ne(blogArticles.id, article.id), eq(blogArticles.isPublished, true))).orderBy(desc(blogArticles.publishedAt)).limit(3),
  ])

  const seen = new Set<string>([article.id])
  const relatedArticles: typeof explicitRelated = []
  for (const candidate of [...explicitRelated, ...categoryFallback]) {
    if (relatedArticles.length >= 3) break
    if (seen.has(candidate.id)) continue
    seen.add(candidate.id)
    relatedArticles.push(candidate)
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
    .select({
      title: blogArticles.title,
      excerpt: blogArticles.excerpt,
      image: blogArticles.image,
      category: blogArticles.category,
      publishedAt: blogArticles.publishedAt,
      updatedAt: blogArticles.updatedAt,
      metaTitle: blogArticles.metaTitle,
      metaDescription: blogArticles.metaDescription,
      tags: blogArticles.tags,
      authorName: users.name,
      authorDisplayName: users.displayName,
    })
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
    updatedAt: row.updatedAt?.toISOString(),
    author: row.authorDisplayName || row.authorName || 'Unknown',
    metaTitle: row.metaTitle ?? null,
    metaDescription: row.metaDescription ?? null,
    tags: row.tags ?? [],
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
  cacheLife('hours') // Admin create/edit/delete handlers call revalidateTag('articles'), so freshness is event-driven, not TTL-driven
  cacheTag('articles', 'articles-initial')
  
  return fetchArticles(1, 12) // First page with 12 articles
}
