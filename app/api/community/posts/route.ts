import { NextRequest, NextResponse, connection } from 'next/server'
import { revalidateTag } from '@/lib/cache'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { communityPosts, users } from '@/lib/db/schema'
import { sanitizeInput } from '@/lib/utils'

// Rate limiting: simple in-memory store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_POSTS = 5 // max 5 posts per minute

// Valid categories (whitelist for security)
const VALID_CATEGORIES = [
  'Gravidez',
  'PÃ³s-parto', 
  'Suporte ContÃ­nuo',
  'Paternidade',
  'Fertilidade',
  'Menopausa',
]

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitStore.get(userId)
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_POSTS) {
    return false
  }
  
  userLimit.count++
  return true
}

export async function POST(request: NextRequest) {
  await connection()

  try {
    const authUser = await requireAuth(request)
    if (authUser instanceof NextResponse) return authUser

    const userId = authUser.id

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Muitos posts criados. Aguarde um momento.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    
    const { title, content, category, subcategory, tags, isAnonymous } = body

    // Validate required fields
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      )
    }

    // Validate category against whitelist
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Validate content length
    if (title.length > 200 || content.length > 5000) {
      return NextResponse.json(
        { error: 'Title or content exceeds maximum length' },
        { status: 400 }
      )
    }

    // Validate tags count
    if (Array.isArray(tags) && tags.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 tags allowed' },
        { status: 400 }
      )
    }

    // Sanitize user input
    const sanitizedTitle = sanitizeInput(title)
    const sanitizedContent = sanitizeInput(content)
    const sanitizedSubcategory = subcategory ? sanitizeInput(subcategory) : null
    const sanitizedTags = Array.isArray(tags) 
      ? tags.map((t: string) => sanitizeInput(t)).filter(Boolean).slice(0, 10)
      : []

    const [newPost] = await db
      .insert(communityPosts)
      .values({
        title: sanitizedTitle,
        content: sanitizedContent,
        userId,
        category,
        subcategory: sanitizedSubcategory,
        tags: sanitizedTags,
        isAnonymous: isAnonymous || false,
        status: 'ACTIVE',
        isReported: false,
        isPinned: false,
        viewCount: 0,
        replyCount: 0,
        likeCount: 0,
      })
      .returning()

    const authorRow = await db
      .select({ name: users.name, displayName: users.displayName })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then((r) => r[0] ?? null)

    const authorName = newPost.isAnonymous
      ? 'AnÃ´nimo'
      : (authorRow?.displayName || authorRow?.name || 'UsuÃ¡rio')

    // Revalidate community cache
    revalidateTag('community')

    return NextResponse.json({
      success: true,
      post: {
        id: newPost.id,
        title: newPost.title,
        content: newPost.content,
        author: authorName,
        category: newPost.category,
        subcategory: newPost.subcategory || '',
        status: 'Ativo',
        replies: [],
        repliesCount: 0,
        likes: 0,
        isAnonymous: newPost.isAnonymous,
        createdDate: new Intl.DateTimeFormat('pt-BR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(newPost.createdAt),
        lastReply: '',
        tags: newPost.tags,
        isReported: false,
      },
      message: 'Post created successfully',
    })
  } catch (error) {
    console.error('Create post API error:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
