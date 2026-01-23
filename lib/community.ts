import { cacheLife, cacheTag } from 'next/cache'
import prisma from '@/lib/prisma'
import { CommunityPost, CommunityReply, CommunityPagination } from '@/types/community'

// Type for post with author and replies from Prisma
type CommunityPostWithRelations = {
  id: string
  title: string
  content: string
  userId: string
  category: string
  subcategory: string | null
  tags: string[]
  isAnonymous: boolean
  status: 'ACTIVE' | 'CLOSED' | 'MODERATION'
  isReported: boolean
  isPinned: boolean
  viewCount: number
  replyCount: number
  likeCount: number
  createdAt: Date
  updatedAt: Date
  lastReplyAt: Date | null
  user_profiles: {
    id: string
    fullName: string | null
    displayName: string | null
    avatar: string | null
  }
  community_replies: CommunityReplyWithAuthor[]
  _count?: {
    community_likes: number
    community_replies: number
  }
}

type CommunityReplyWithAuthor = {
  id: string
  postId: string
  userId: string
  content: string
  isAnonymous: boolean
  isReported: boolean
  likeCount: number
  createdAt: Date
  updatedAt: Date
  user_profiles: {
    id: string
    fullName: string | null
    displayName: string | null
    avatar: string | null
  }
}

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

// Transform reply from Prisma to frontend format
function transformReply(reply: CommunityReplyWithAuthor): CommunityReply {
  const authorName = reply.isAnonymous 
    ? 'Anônimo' 
    : (reply.user_profiles.displayName || reply.user_profiles.fullName || 'Usuário')
  
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

// Transform Prisma post to frontend CommunityPost type
function transformPost(post: CommunityPostWithRelations, includeReplies = false): CommunityPost {
  const authorName = post.isAnonymous 
    ? 'Anônimo' 
    : (post.user_profiles.displayName || post.user_profiles.fullName || 'Usuário')
  
  const replies = includeReplies && post.community_replies 
    ? post.community_replies.map(transformReply)
    : []
  
  // Check if any reply is reported
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
    repliesCount: post._count?.community_replies ?? post.replyCount,
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
  const whereCondition: Record<string, unknown> = {}
  
  // Filter by isReported - includes posts that are reported OR have reported replies
  if (isReported === 'true') {
    whereCondition.OR = [
      { isReported: true },
      {
        community_replies: {
          some: { isReported: true }
        }
      }
    ]
  } else if (isReported === 'false') {
    whereCondition.isReported = false
  }
  
  // Filter by status (default to active posts only for public view, but not when filtering reported)
  if (status) {
    const statusKey = Object.entries(statusMap).find(([, v]) => v.toLowerCase() === status.toLowerCase())?.[0]
    if (statusKey) {
      whereCondition.status = statusKey
    }
  } else if (!isReported) {
    whereCondition.status = 'ACTIVE' // Default to active posts only when not filtering by reported
  }
  
  // Filter by category
  if (category) {
    // Support both Portuguese names and URL-friendly names
    const categoryName = categoryMap[category.toLowerCase()] || category
    whereCondition.category = categoryName
  }
  
  // Search in title, content, and tags
  if (search) {
    // Use AND to combine with existing conditions (like isReported OR)
    whereCondition.AND = [
      ...(whereCondition.AND as Array<unknown> || []),
      {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ]
      }
    ]
  }

  const [posts, totalPosts, allCategories]: [unknown[], number, { category: string }[]] = await Promise.all([
    prisma.community_posts.findMany({
      where: whereCondition,
      select: {
        id: true,
        title: true,
        content: true,
        userId: true,
        category: true,
        subcategory: true,
        tags: true,
        isAnonymous: true,
        status: true,
        isReported: true,
        isPinned: true,
        viewCount: true,
        replyCount: true,
        likeCount: true,
        createdAt: true,
        updatedAt: true,
        lastReplyAt: true,
        user_profiles: {
          select: {
            id: true,
            fullName: true,
            displayName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            community_likes: true,
            community_replies: true,
          },
        },
        community_replies: {
          select: {
            id: true,
            postId: true,
            userId: true,
            content: true,
            isAnonymous: true,
            isReported: true,
            likeCount: true,
            createdAt: true,
            updatedAt: true,
            user_profiles: {
              select: {
                id: true,
                fullName: true,
                displayName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
          take: 10, // Limit replies per post for list view
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { lastReplyAt: 'desc' },
        { createdAt: 'desc' },
      ],
      skip: page * limit,
      take: limit,
    }),
    prisma.community_posts.count({
      where: whereCondition,
    }),
    prisma.community_posts.findMany({
      where: { status: 'ACTIVE' },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    }),
  ])

  const transformedPosts = (posts as CommunityPostWithRelations[]).map((post) => 
    transformPost(post, true)
  )

  const totalPages = Math.ceil(totalPosts / limit)
  const categories = allCategories.map((c: { category: string }) => c.category)

  const pagination: CommunityPagination = {
    page,
    pageSize: limit,
    totalItems: totalPosts,
    totalPages,
    hasNextPage: page < totalPages - 1,
    hasPreviousPage: page > 0,
  }

  return {
    posts: transformedPosts,
    pagination,
    categories,
    totalCount: totalPosts,
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
  const post = await prisma.community_posts.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      userId: true,
      category: true,
      subcategory: true,
      tags: true,
      isAnonymous: true,
      status: true,
      isReported: true,
      isPinned: true,
      viewCount: true,
      replyCount: true,
      likeCount: true,
      createdAt: true,
      updatedAt: true,
      lastReplyAt: true,
      user_profiles: {
        select: {
          id: true,
          fullName: true,
          displayName: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          community_likes: true,
          community_replies: true,
        },
      },
      community_replies: {
        select: {
          id: true,
          postId: true,
          userId: true,
          content: true,
          isAnonymous: true,
          isReported: true,
          likeCount: true,
          createdAt: true,
          updatedAt: true,
          user_profiles: {
            select: {
              id: true,
              fullName: true,
              displayName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!post) {
    return null
  }

  // Increment view count (fire and forget)
  prisma.community_posts.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {}) // Ignore errors

  return transformPost(post as unknown as CommunityPostWithRelations, true)
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
  // Check if post exists and user has permission
  const post = await prisma.community_posts.findUnique({
    where: { id },
    select: { userId: true },
  })

  if (!post) {
    return null
  }

  // Get user role to check if admin
  const roleAssignment = await prisma.user_roles.findFirst({
    where: { userId },
    select: { role: true },
    orderBy: { createdAt: 'desc' },
  })

  const userRole = roleAssignment?.role || 'STUDENT'
  const isAdmin = userRole === 'ADMIN' || userRole === 'INSTRUCTOR'
  const isAuthor = post.userId === userId

  // Only admin or author can update
  if (!isAdmin && !isAuthor) {
    return null
  }

  // Authors can only update certain fields
  const allowedFields = isAdmin 
    ? data 
    : {
        title: data.title,
        content: data.content,
        tags: data.tags,
      }

  const updatedPost = await prisma.community_posts.update({
    where: { id },
    data: {
      ...allowedFields,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      title: true,
      content: true,
      userId: true,
      category: true,
      subcategory: true,
      tags: true,
      isAnonymous: true,
      status: true,
      isReported: true,
      isPinned: true,
      viewCount: true,
      replyCount: true,
      likeCount: true,
      createdAt: true,
      updatedAt: true,
      lastReplyAt: true,
      user_profiles: {
        select: {
          id: true,
          fullName: true,
          displayName: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          community_likes: true,
          community_replies: true,
        },
      },
      community_replies: {
        select: {
          id: true,
          postId: true,
          userId: true,
          content: true,
          isAnonymous: true,
          isReported: true,
          likeCount: true,
          createdAt: true,
          updatedAt: true,
          user_profiles: {
            select: {
              id: true,
              fullName: true,
              displayName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        take: 10,
      },
    },
  })

  return transformPost(updatedPost as unknown as CommunityPostWithRelations, true)
}

// Delete post (admin or author)
export async function deletePost(id: string, userId: string) {
  // Check if post exists and user has permission
  const post = await prisma.community_posts.findUnique({
    where: { id },
    select: { userId: true },
  })

  if (!post) {
    return false
  }

  // Get user role to check if admin
  const roleAssignment = await prisma.user_roles.findFirst({
    where: { userId },
    select: { role: true },
    orderBy: { createdAt: 'desc' },
  })

  const userRole = roleAssignment?.role || 'STUDENT'
  const isAdmin = userRole === 'ADMIN' || userRole === 'INSTRUCTOR'
  const isAuthor = post.userId === userId

  // Only admin or author can delete
  if (!isAdmin && !isAuthor) {
    return false
  }

  // Delete related records first (replies, likes)
  await prisma.$transaction([
    prisma.community_reply_likes.deleteMany({
      where: { community_replies: { postId: id } },
    }),
    prisma.community_replies.deleteMany({
      where: { postId: id },
    }),
    prisma.community_likes.deleteMany({
      where: { postId: id },
    }),
    prisma.community_posts.delete({
      where: { id },
    }),
  ])

  return true
}

// Get post metadata for SEO
export async function getPostMetadata(id: string) {
  'use cache'
  cacheLife('minutes')
  cacheTag('community', `community-post-${id}`)
  
  const post = await prisma.community_posts.findUnique({
    where: { id },
    select: {
      title: true,
      content: true,
      category: true,
      tags: true,
      createdAt: true,
      user_profiles: {
        select: {
          fullName: true,
          displayName: true,
        },
      },
    },
  })

  if (!post) {
    return null
  }

  return {
    title: post.title,
    description: post.content.substring(0, 160),
    category: post.category,
    tags: post.tags,
    date: post.createdAt.toISOString(),
    author: post.user_profiles.fullName || post.user_profiles.displayName || 'Anônimo',
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
  
  const stats = await prisma.community_posts.groupBy({
    by: ['category'],
    where: { status: 'ACTIVE' },
    _count: { id: true },
    orderBy: { category: 'asc' },
  })

  return stats.map((stat: { category: string; _count: { id: number } }) => ({
    category: stat.category,
    slug: reverseCategoryMap[stat.category] || stat.category.toLowerCase(),
    count: stat._count.id,
  }))
}

// Get recent activity (latest replies across all posts)
export async function getRecentActivity(limit = 5) {
  'use cache'
  cacheLife('minutes')
  cacheTag('community', 'community-recent-activity')
  
  const recentReplies = await prisma.community_replies.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      content: true,
      createdAt: true,
      isAnonymous: true,
      user_profiles: {
        select: {
          displayName: true,
          fullName: true,
          avatar: true,
        },
      },
      community_posts: {
        select: {
          id: true,
          title: true,
          category: true,
        },
      },
    },
  })

  type RecentReply = {
    id: string
    content: string
    createdAt: Date
    isAnonymous: boolean
    user_profiles: {
      displayName: string | null
      fullName: string | null
      avatar: string | null
    }
    community_posts: {
      id: string
      title: string
      category: string
    }
  }

  return recentReplies.map((reply: RecentReply) => ({
    id: reply.id,
    content: reply.content.substring(0, 100),
    createdAt: formatDate(reply.createdAt),
    author: reply.isAnonymous 
      ? 'Anônimo' 
      : (reply.user_profiles.displayName || reply.user_profiles.fullName || 'Usuário'),
    authorAvatar: reply.user_profiles.avatar,
    post: {
      id: reply.community_posts.id,
      title: reply.community_posts.title,
      category: reply.community_posts.category,
    },
  }))
}
