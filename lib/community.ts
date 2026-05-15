import { cacheLife, cacheTag } from 'next/cache'
import { and, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { communityPosts, communityLikes, communityReplies, communityReplyLikes, users } from '@/lib/db/schema'
import { CommunityPost, CommunityReply, CommunityPagination } from '@/types/community'

// Status mapping from enum to display format
const statusMap: Record<string, 'Ativo' | 'Fechado' | 'Moderação'> = {
  'ACTIVE': 'Ativo',
  'CLOSED': 'Fechado',
  'MODERATION': 'Moderação',
}

// Category mapping for URL-friendly names
const categoryMap: Record<string, string> = {
  'pregnancy': 'Gravidez',
  'postpartum': 'Pós-parto',
  'support': 'Suporte Contínuo',
  'paternity': 'Paternidade',
  'fertility': 'Fertilidade',
  'menopause': 'Menopausa',
}

const reverseCategoryMap: Record<string, string> = {
  'Gravidez': 'pregnancy',
  'Pós-parto': 'postpartum',
  'Suporte Contínuo': 'support',
  'Paternidade': 'paternity',
  'Fertilidade': 'fertility',
  'Menopausa': 'menopause',
}

// Format date in Portuguese
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

// Transform reply from DB to frontend format
function transformReply(reply: { id: string; content: string; isAnonymous: boolean; isReported: boolean; likeCount: number; createdAt: Date; authorName: string | null; authorDisplayName: string | null }): CommunityReply {
  const authorName = reply.isAnonymous 
    ? 'Anônimo' 
    : (reply.authorDisplayName || reply.authorName || 'Usuário')
  
  return {
    id: reply.id,
    content: reply.content,
    author: authorName,
    isAnonymous: reply.isAnonymous,
    createdDate: formatDate(reply.createdAt),
    likes: reply.likeCount,
    isReported: reply.isReported,
  }
}

// Transform DB post to frontend CommunityPost type
function transformPost(post: { id: string; title: string; content: string; userId: string; category: string; subcategory: string | null; tags: string[]; isAnonymous: boolean; status: string; isReported: boolean; isPinned: boolean; viewCount: number; replyCount: number; likeCount: number; createdAt: Date; updatedAt: Date; lastReplyAt: Date | null; authorName: string | null; authorDisplayName: string | null }, replies: ReturnType<typeof transformReply>[] = []): CommunityPost {
  const authorName = post.isAnonymous 
    ? 'Anônimo' 
    : (post.authorDisplayName || post.authorName || 'Usuário')
  
  const hasReportedReplies = replies.some(reply => reply.isReported)
  
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    author: authorName,
    category: post.category as CommunityPost['category'],
    subcategory: post.subcategory || '',
    status: statusMap[post.status] || 'Ativo',
    replies,
    repliesCount: post.replyCount,
    likes: post.likeCount,
    isAnonymous: post.isAnonymous,
    createdDate: formatDate(post.createdAt),
    lastReply: post.lastReplyAt ? formatDate(post.lastReplyAt) : '',
    tags: post.tags,
    isReported: post.isReported,
    hasReportedReplies,
  }
}

// Internal function to fetch posts from database
async function fetchCommunityPosts(
  page: number, 
  limit: number, 
  category?: string,
  search?: string,
  status?: string,
  isReported?: string
) {
  const postWhere = and(
    isReported === 'true' ? undefined : isReported === 'false' ? eq(communityPosts.isReported, false) : undefined,
    status ? (() => { const k = Object.entries(statusMap).find(([, v]) => v.toLowerCase() === status.toLowerCase())?.[0]; return k ? eq(communityPosts.status, k as 'ACTIVE' | 'CLOSED' | 'MODERATION') : undefined })() : (!isReported ? eq(communityPosts.status, 'ACTIVE') : undefined),
    category ? eq(communityPosts.category, categoryMap[category.toLowerCase()] || category) : undefined,
    search ? or(ilike(communityPosts.title, `%${search}%`), ilike(communityPosts.content, `%${search}%`)) : undefined,
    isReported === 'true' ? or(eq(communityPosts.isReported, true), sql`EXISTS (SELECT 1 FROM "community_replies" r WHERE r."postId" = ${communityPosts.id} AND r."isReported" = true)`) : undefined,
  )

  const replyAuthor = (await import('drizzle-orm/pg-core')).alias(users, 'replyAuthor')

  const [rows, [{ total }], categoriesRaw] = await Promise.all([
    db
      .select({
        id: communityPosts.id,
        title: communityPosts.title,
        content: communityPosts.content,
        userId: communityPosts.userId,
        category: communityPosts.category,
        subcategory: communityPosts.subcategory,
        tags: communityPosts.tags,
        isAnonymous: communityPosts.isAnonymous,
        status: communityPosts.status,
        isReported: communityPosts.isReported,
        isPinned: communityPosts.isPinned,
        viewCount: communityPosts.viewCount,
        replyCount: communityPosts.replyCount,
        likeCount: communityPosts.likeCount,
        createdAt: communityPosts.createdAt,
        updatedAt: communityPosts.updatedAt,
        lastReplyAt: communityPosts.lastReplyAt,
        authorName: users.name,
        authorDisplayName: users.displayName,
      })
      .from(communityPosts)
      .innerJoin(users, eq(communityPosts.userId, users.id))
      .where(postWhere)
      .orderBy(desc(communityPosts.isPinned), desc(communityPosts.lastReplyAt), desc(communityPosts.createdAt))
      .offset(page * limit)
      .limit(limit),
    db.select({ total: sql<number>`count(*)::int` }).from(communityPosts).where(postWhere),
    db.selectDistinct({ category: communityPosts.category }).from(communityPosts).where(eq(communityPosts.status, 'ACTIVE')).orderBy(communityPosts.category),
  ])

  // Fetch replies for all posts
  const postIds = rows.map((p) => p.id)
  const repliesRows = postIds.length > 0
    ? await db
        .select({
          id: communityReplies.id,
          postId: communityReplies.postId,
          content: communityReplies.content,
          isAnonymous: communityReplies.isAnonymous,
          isReported: communityReplies.isReported,
          likeCount: communityReplies.likeCount,
          createdAt: communityReplies.createdAt,
          authorName: replyAuthor.name,
          authorDisplayName: replyAuthor.displayName,
        })
        .from(communityReplies)
        .innerJoin(replyAuthor, eq(communityReplies.userId, replyAuthor.id))
        .where(inArray(communityReplies.postId, postIds))
        .orderBy(communityReplies.postId, communityReplies.createdAt)
        .limit(10 * postIds.length)
    : []

  const repliesByPostId = repliesRows.reduce<Record<string, typeof repliesRows>>((acc, r) => {
    if (!acc[r.postId]) acc[r.postId] = []
    acc[r.postId].push(r)
    return acc
  }, {})

  const transformedPosts = rows.map((post) => transformPost(post, (repliesByPostId[post.id] || []).map(transformReply)))

  const totalCount = Number(total)
  const totalPages = Math.ceil(totalCount / limit)
  const categories = categoriesRaw.map((c) => c.category)

  const pagination: CommunityPagination = {
    page,
    pageSize: limit,
    totalItems: totalCount,
    totalPages,
    hasNextPage: page < totalPages - 1,
    hasPreviousPage: page > 0,
  }

  return {
    posts: transformedPosts,
    pagination,
    categories,
    totalCount,
    pageCount: totalPages,
  }
}

// Get paginated community posts with optional filters using Next.js 16 Cache Components
export async function getCommunityPosts(
  page: number, 
  limit: number, 
  category?: string,
  search?: string,
  status?: string,
  isReported?: string
) {
  'use cache'
  cacheLife('minutes') // Community posts change frequently
  cacheTag('community', `community-posts-${page}-${limit}-${category || 'all'}-${search || ''}-${status || ''}-${isReported || ''}`)
  
  return fetchCommunityPosts(page, limit, category, search, status, isReported)
}

// Internal function to fetch single post
async function fetchPostById(id: string) {
  const replyAuthor = (await import('drizzle-orm/pg-core')).alias(users, 'replyAuthor')

  const row = await db
    .select({
      id: communityPosts.id,
      title: communityPosts.title,
      content: communityPosts.content,
      userId: communityPosts.userId,
      category: communityPosts.category,
      subcategory: communityPosts.subcategory,
      tags: communityPosts.tags,
      isAnonymous: communityPosts.isAnonymous,
      status: communityPosts.status,
      isReported: communityPosts.isReported,
      isPinned: communityPosts.isPinned,
      viewCount: communityPosts.viewCount,
      replyCount: communityPosts.replyCount,
      likeCount: communityPosts.likeCount,
      createdAt: communityPosts.createdAt,
      updatedAt: communityPosts.updatedAt,
      lastReplyAt: communityPosts.lastReplyAt,
      authorName: users.name,
      authorDisplayName: users.displayName,
    })
    .from(communityPosts)
    .innerJoin(users, eq(communityPosts.userId, users.id))
    .where(eq(communityPosts.id, id))
    .limit(1)
    .then((r) => r[0] ?? null)

  if (!row) return null

  const repliesRows = await db
    .select({
      id: communityReplies.id,
      postId: communityReplies.postId,
      content: communityReplies.content,
      isAnonymous: communityReplies.isAnonymous,
      isReported: communityReplies.isReported,
      likeCount: communityReplies.likeCount,
      createdAt: communityReplies.createdAt,
      authorName: replyAuthor.name,
      authorDisplayName: replyAuthor.displayName,
    })
    .from(communityReplies)
    .innerJoin(replyAuthor, eq(communityReplies.userId, replyAuthor.id))
    .where(eq(communityReplies.postId, id))
    .orderBy(communityReplies.createdAt)

  // Increment view count (fire and forget)
  db.update(communityPosts).set({ viewCount: sql`${communityPosts.viewCount} + 1` }).where(eq(communityPosts.id, id)).catch(() => {})

  return transformPost(row, repliesRows.map(transformReply))
}

// Get single post by ID with all replies using Next.js 16 Cache Components
export async function getPostById(id: string) {
  'use cache'
  cacheLife('minutes')
  cacheTag('community', `community-post-${id}`)
  
  return fetchPostById(id)
}

// Update post (admin or author)
export async function updatePost(
  id: string, 
  data: {
    title?: string
    content?: string
    category?: string
    subcategory?: string
    tags?: string[]
    status?: 'ACTIVE' | 'CLOSED' | 'MODERATION'
    isReported?: boolean
    isPinned?: boolean
  },
  userId: string
) {
  const post = await db.select({ userId: communityPosts.userId }).from(communityPosts).where(eq(communityPosts.id, id)).limit(1).then((r) => r[0] ?? null)
  if (!post) return null

  const currentUser = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1).then((r) => r[0] ?? null)
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'INSTRUCTOR'
  const isAuthor = post.userId === userId
  if (!isAdmin && !isAuthor) return null

  const allowedFields = isAdmin ? data : { title: data.title, content: data.content, tags: data.tags }

  const replyAuthor = (await import('drizzle-orm/pg-core')).alias(users, 'replyAuthor')

  await db.update(communityPosts).set({ ...allowedFields, updatedAt: new Date() }).where(eq(communityPosts.id, id))

  const fullRow = await db
    .select({ id: communityPosts.id, title: communityPosts.title, content: communityPosts.content, userId: communityPosts.userId, category: communityPosts.category, subcategory: communityPosts.subcategory, tags: communityPosts.tags, isAnonymous: communityPosts.isAnonymous, status: communityPosts.status, isReported: communityPosts.isReported, isPinned: communityPosts.isPinned, viewCount: communityPosts.viewCount, replyCount: communityPosts.replyCount, likeCount: communityPosts.likeCount, createdAt: communityPosts.createdAt, updatedAt: communityPosts.updatedAt, lastReplyAt: communityPosts.lastReplyAt, authorName: users.name, authorDisplayName: users.displayName })
    .from(communityPosts)
    .innerJoin(users, eq(communityPosts.userId, users.id))
    .where(eq(communityPosts.id, id))
    .limit(1)
    .then((r) => r[0] ?? null)

  if (!fullRow) return null

  const repliesRows = await db
    .select({ id: communityReplies.id, postId: communityReplies.postId, content: communityReplies.content, isAnonymous: communityReplies.isAnonymous, isReported: communityReplies.isReported, likeCount: communityReplies.likeCount, createdAt: communityReplies.createdAt, authorName: replyAuthor.name, authorDisplayName: replyAuthor.displayName })
    .from(communityReplies)
    .innerJoin(replyAuthor, eq(communityReplies.userId, replyAuthor.id))
    .where(eq(communityReplies.postId, id))
    .orderBy(communityReplies.createdAt)
    .limit(10)

  return transformPost(fullRow, repliesRows.map(transformReply))
}

// Delete post (admin or author)
export async function deletePost(id: string, userId: string) {
  const post = await db.select({ userId: communityPosts.userId }).from(communityPosts).where(eq(communityPosts.id, id)).limit(1).then((r) => r[0] ?? null)
  if (!post) return false

  const currentUser = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1).then((r) => r[0] ?? null)
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'INSTRUCTOR'
  const isAuthor = post.userId === userId
  if (!isAdmin && !isAuthor) return false

  // Delete reply likes first (FK constraint), then replies and post likes
  // Fetch IDs in batches to avoid unbounded result sets
  let offset = 0
  const BATCH = 500
  while (true) {
    const batch = await db.select({ id: communityReplies.id }).from(communityReplies).where(eq(communityReplies.postId, id)).limit(BATCH).offset(offset)
    if (batch.length === 0) break
    await db.delete(communityReplyLikes).where(inArray(communityReplyLikes.replyId, batch.map((r) => r.id)))
    offset += BATCH
    if (batch.length < BATCH) break
  }
  await db.delete(communityReplies).where(eq(communityReplies.postId, id))
  await db.delete(communityLikes).where(eq(communityLikes.postId, id))
  await db.delete(communityPosts).where(eq(communityPosts.id, id))

  return true
}

// Get post metadata for SEO
export async function getPostMetadata(id: string) {
  'use cache'
  cacheLife('minutes')
  cacheTag('community', `community-post-${id}`)
  
  const row = await db
    .select({ title: communityPosts.title, content: communityPosts.content, category: communityPosts.category, tags: communityPosts.tags, createdAt: communityPosts.createdAt, authorName: users.name, authorDisplayName: users.displayName })
    .from(communityPosts)
    .innerJoin(users, eq(communityPosts.userId, users.id))
    .where(eq(communityPosts.id, id))
    .limit(1)
    .then((r) => r[0] ?? null)

  if (!row) return null

  return {
    title: row.title,
    description: row.content.substring(0, 160),
    category: row.category,
    tags: row.tags,
    date: row.createdAt.toISOString(),
    author: row.authorDisplayName || row.authorName || 'Anônimo',
  }
}

// Get initial posts for SSR (first page)
export async function getInitialCommunityPosts(category?: string) {
  'use cache'
  cacheLife('minutes')
  cacheTag('community', `community-initial-${category || 'all'}`)
  
  return fetchCommunityPosts(0, 10, category)
}

// Get category statistics
export async function getCategoryStats() {
  'use cache'
  cacheLife('hours')
  cacheTag('community', 'community-category-stats')
  
  const stats = await db
    .select({ category: communityPosts.category, count: sql<number>`count(*)::int` })
    .from(communityPosts)
    .where(eq(communityPosts.status, 'ACTIVE'))
    .groupBy(communityPosts.category)
    .orderBy(communityPosts.category)

  return stats.map((stat) => ({
    category: stat.category,
    slug: reverseCategoryMap[stat.category] || stat.category.toLowerCase(),
    count: Number(stat.count),
  }))
}

// Get recent activity (latest replies across all posts)
export async function getRecentActivity(limit = 5) {
  'use cache'
  cacheLife('minutes')
  cacheTag('community', 'community-recent-activity')
  
  const replyAuthor = (await import('drizzle-orm/pg-core')).alias(users, 'replyAuthor')

  const rows = await db
    .select({
      id: communityReplies.id,
      content: communityReplies.content,
      createdAt: communityReplies.createdAt,
      isAnonymous: communityReplies.isAnonymous,
      authorDisplayName: replyAuthor.displayName,
      authorName: replyAuthor.name,
      authorAvatar: replyAuthor.image,
      postId: communityPosts.id,
      postTitle: communityPosts.title,
      postCategory: communityPosts.category,
    })
    .from(communityReplies)
    .innerJoin(replyAuthor, eq(communityReplies.userId, replyAuthor.id))
    .innerJoin(communityPosts, eq(communityReplies.postId, communityPosts.id))
    .orderBy(desc(communityReplies.createdAt))
    .limit(limit)

  return rows.map((reply) => ({
    id: reply.id,
    content: reply.content.substring(0, 100),
    createdAt: formatDate(reply.createdAt),
    author: reply.isAnonymous ? 'Anônimo' : (reply.authorDisplayName || reply.authorName || 'Usuário'),
    authorAvatar: reply.authorAvatar,
    post: { id: reply.postId, title: reply.postTitle, category: reply.postCategory },
  }))
}
