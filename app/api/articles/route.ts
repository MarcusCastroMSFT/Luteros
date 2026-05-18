import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from '@/lib/cache'
import { requireAdmin } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { blogArticles, users } from '@/lib/db/schema'
import { asc, desc, eq, ilike, or, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '0')
  const pageSize = parseInt(searchParams.get('pageSize') || '10')
  const search = searchParams.get('search') || ''
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) return authResult

    const orderDir = sortOrder === 'asc' ? asc : desc
    const sortColumn =
      sortBy === 'title' ? blogArticles.title :
      sortBy === 'category' ? blogArticles.category :
      sortBy === 'date' ? blogArticles.publishedAt :
      sortBy === 'commentCount' ? blogArticles.commentCount :
      blogArticles.createdAt

    const whereCondition = search
      ? or(
          ilike(blogArticles.title, `%${search}%`),
          ilike(blogArticles.excerpt, `%${search}%`),
          ilike(blogArticles.category, `%${search}%`),
        )
      : undefined

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: blogArticles.id,
          title: blogArticles.title,
          slug: blogArticles.slug,
          excerpt: blogArticles.excerpt,
          image: blogArticles.image,
          category: blogArticles.category,
          readTime: blogArticles.readTime,
          commentCount: blogArticles.commentCount,
          isPublished: blogArticles.isPublished,
          publishedAt: blogArticles.publishedAt,
          createdAt: blogArticles.createdAt,
          updatedAt: blogArticles.updatedAt,
          accessType: blogArticles.accessType,
          targetAudience: blogArticles.targetAudience,
          authorId: users.id,
          authorName: users.name,
          authorDisplayName: users.displayName,
          authorAvatar: users.image,
        })
        .from(blogArticles)
        .innerJoin(users, eq(blogArticles.authorId, users.id))
        .where(whereCondition)
        .orderBy(orderDir(sortColumn))
        .limit(pageSize)
        .offset(page * pageSize),
      db.select({ total: sql<number>`count(*)::int` }).from(blogArticles).where(whereCondition),
    ])

    const transformedArticles = rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      image: r.image,
      author: r.authorName || r.authorDisplayName || 'Unknown',
      authorId: r.authorId,
      authorAvatar: r.authorAvatar,
      category: r.category,
      status: r.isPublished ? 'Ativo' : 'Rascunho',
      paid: r.accessType === 'paid' ? 'Pago' : 'Gratuito',
      audience: r.targetAudience === 'doctors' ? 'Médicos' : 'Público Geral',
      date: r.publishedAt?.toISOString() || r.createdAt.toISOString(),
      readTime: `${r.readTime} min`,
      commentCount: r.commentCount,
    }))

    const pageCount = Math.ceil(total / pageSize)

    return NextResponse.json({
      data: transformedArticles,
      totalCount: total,
      pageCount,
      page,
      pageSize,
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) return authResult

    const body = await request.json()
    const {
      title, slug, excerpt, content, references, image, category, readTime,
      isPublished, authorId, relatedArticleIds = [],
      accessType = 'free', targetAudience = 'general',
    } = body

    if (!title || !slug || !excerpt || !content || !category) {
      return NextResponse.json({ success: false, error: 'Campos obrigatÃ³rios faltando' }, { status: 400 })
    }

    if (relatedArticleIds && relatedArticleIds.length > 3) {
      return NextResponse.json({ success: false, error: 'MÃ¡ximo de 3 artigos relacionados permitidos' }, { status: 400 })
    }

    const finalAuthorId = authorId || authResult.user.id

    const existing = await db
      .select({ id: blogArticles.id })
      .from(blogArticles)
      .where(eq(blogArticles.slug, slug))
      .limit(1)
      .then((r) => r[0] ?? null)

    if (existing) {
      return NextResponse.json({ success: false, error: 'JÃ¡ existe um artigo com esse slug' }, { status: 400 })
    }

    const [article] = await db.insert(blogArticles).values({
      title,
      slug,
      excerpt,
      content,
      references: references || null,
      image: image || null,
      category,
      readTime: readTime || 5,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      authorId: finalAuthorId,
      relatedArticleIds: relatedArticleIds || [],
      accessType,
      targetAudience,
      commentCount: 0,
    }).returning()

    // Cache invalidation so users see the new article immediately
    revalidateTag('articles')         // public list + home (via getArticles)
    revalidateTag('article-slugs')    // getAllArticleSlugs (used by generateStaticParams)
    revalidateTag(`article-${slug}`)  // detail page + metadata for this slug
    revalidatePath('/')               // home renders latest 4
    revalidatePath('/articles')       // list page
    revalidatePath(`/articles/${slug}`) // detail page

    return NextResponse.json({ success: true, data: article })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar artigo' }, { status: 500 })
  }
}


