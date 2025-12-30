import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Extract pagination parameters
  const page = parseInt(searchParams.get('page') || '0')
  const pageSize = parseInt(searchParams.get('pageSize') || '10')
  const search = searchParams.get('search') || ''
  
  // Extract sorting parameters
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
  
  try {
    // Verify authentication (with caching)
    const authUser = await requireAuth(request)
    if (authUser instanceof NextResponse) {
      return authUser // Return 401 response
    }

    // Build where condition for Prisma query
    const whereCondition: Record<string, unknown> = {}
    
    // Apply search filter
    if (search) {
      whereCondition.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    // Build orderBy condition - map frontend fields to database fields
    const orderByMap: Record<string, Record<string, unknown>> = {
      title: { title: sortOrder },
      author: { author: { fullName: sortOrder } },
      category: { category: sortOrder },
      date: { publishedAt: sortOrder },
      createdAt: { createdAt: sortOrder },
      viewCount: { viewCount: sortOrder },
      commentCount: { commentCount: sortOrder },
    }
    
    const orderBy = orderByMap[sortBy] || { createdAt: sortOrder }

    // Execute queries in parallel for performance
    const [articles, totalCount] = await Promise.all([
      prisma.blogArticle.findMany({
        where: whereCondition,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          image: true,
          category: true,
          readTime: true,
          viewCount: true,
          commentCount: true,
          isPublished: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          accessType: true,
          targetAudience: true,
          author: {
            select: {
              id: true,
              fullName: true,
              displayName: true,
              avatar: true,
            }
          }
        },
        orderBy,
        skip: page * pageSize,
        take: pageSize,
      }),
      prisma.blogArticle.count({
        where: whereCondition,
      }),
    ])

    // Transform data to match frontend interface
    const transformedArticles = articles.map(article => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      image: article.image,
      author: article.author.fullName || article.author.displayName || 'Unknown',
      authorId: article.author.id,
      authorAvatar: article.author.avatar,
      category: article.category,
      status: article.isPublished ? 'Ativo' : 'Rascunho',
      paid: article.accessType === 'paid' ? 'Pago' : 'Gratuito',
      audience: article.targetAudience === 'doctors' ? 'Médicos' : 'Público Geral',
      date: article.publishedAt?.toISOString() || article.createdAt.toISOString(),
      readTime: `${article.readTime} min`,
      commentCount: article.commentCount,
      viewCount: article.viewCount,
    }))

    const pageCount = Math.ceil(totalCount / pageSize)

    return NextResponse.json({
      data: transformedArticles,
      totalCount,
      pageCount,
      page,
      pageSize,
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication (with caching)
    const authUser = await requireAuth(request)
    if (authUser instanceof NextResponse) {
      return authUser // Return 401 response
    }

    // Parse request body
    const body = await request.json()
    const { title, slug, excerpt, content, image, category, readTime, isPublished, authorId, relatedArticleIds = [], accessType = 'free', targetAudience = 'general' } = body

    // Validation
    if (!title || !slug || !excerpt || !content || !category) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    // Validate relatedArticleIds (max 3)
    if (relatedArticleIds && relatedArticleIds.length > 3) {
      return NextResponse.json(
        { success: false, error: 'Máximo de 3 artigos relacionados permitidos' },
        { status: 400 }
      )
    }

    // Use provided authorId or default to the authenticated user
    const finalAuthorId = authorId || authUser.id

    // Check if slug already exists
    const existingArticle = await prisma.blogArticle.findUnique({
      where: { slug }
    })

    if (existingArticle) {
      return NextResponse.json(
        { success: false, error: 'Já existe um artigo com esse slug' },
        { status: 400 }
      )
    }

    // Create article
    const article = await prisma.blogArticle.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        image: image || null,
        category,
        readTime: readTime || 5,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
        authorId: finalAuthorId,
        relatedArticleIds: relatedArticleIds || [],
        accessType,
        targetAudience,
        viewCount: 0,
        commentCount: 0,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            displayName: true,
            avatar: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: article,
    })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao criar artigo' },
      { status: 500 }
    )
  }
}
