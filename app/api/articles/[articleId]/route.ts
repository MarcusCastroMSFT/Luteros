import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from '@/lib/cache'
import { requireAdmin } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { blogArticles, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ articleId: string }> }
) {
  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) return authResult

    const { articleId } = await context.params

    const row = await db
      .select({
        id: blogArticles.id,
        slug: blogArticles.slug,
        title: blogArticles.title,
        excerpt: blogArticles.excerpt,
        content: blogArticles.content,
        image: blogArticles.image,
        category: blogArticles.category,
        readTime: blogArticles.readTime,
        commentCount: blogArticles.commentCount,
        isPublished: blogArticles.isPublished,
        publishedAt: blogArticles.publishedAt,
        createdAt: blogArticles.createdAt,
        authorId: users.id,
        authorName: users.name,
        authorAvatar: users.image,
      })
      .from(blogArticles)
      .innerJoin(users, eq(blogArticles.authorId, users.id))
      .where(eq(blogArticles.id, articleId))
      .limit(1)
      .then((r) => r[0] ?? null)

    if (!row) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 })
    }

    const articleDate = row.publishedAt || row.createdAt
    const formattedDate = new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(articleDate))

    return NextResponse.json({
      success: true,
      data: {
        id: row.id,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        content: row.content,
        image: row.image || '',
        category: row.category,
        author: {
          name: row.authorName || 'Unknown',
          avatar: row.authorAvatar || '/images/default-avatar.svg',
        },
        date: formattedDate,
        readTime: `${row.readTime} min`,
        commentCount: row.commentCount,
        status: row.isPublished ? 'published' : 'draft',
      },
    })
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ articleId: string }> }
) {
  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) return authResult

    const { articleId } = await context.params
    const body = await request.json()
    const {
      title, slug, excerpt, content, image, category, readTime,
      isPublished, authorId, relatedArticleIds = [],
      accessType = 'free', targetAudience = 'general',
    } = body

    if (!title || !slug || !excerpt || !content || !category) {
      return NextResponse.json({ success: false, error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    if (relatedArticleIds && relatedArticleIds.length > 3) {
      return NextResponse.json({ success: false, error: 'Máximo de 3 artigos relacionados permitidos' }, { status: 400 })
    }

    const existing = await db
      .select({
        id: blogArticles.id,
        slug: blogArticles.slug,
        isPublished: blogArticles.isPublished,
        publishedAt: blogArticles.publishedAt,
        authorId: blogArticles.authorId,
      })
      .from(blogArticles)
      .where(eq(blogArticles.id, articleId))
      .limit(1)
      .then((r) => r[0] ?? null)

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Artigo não encontrado' }, { status: 404 })
    }

    if (slug !== existing.slug) {
      const conflict = await db
        .select({ id: blogArticles.id })
        .from(blogArticles)
        .where(eq(blogArticles.slug, slug))
        .limit(1)
        .then((r) => r[0] ?? null)
      if (conflict) {
        return NextResponse.json({ success: false, error: 'Já existe um artigo com esse slug' }, { status: 400 })
      }
    }

    const [updated] = await db
      .update(blogArticles)
      .set({
        title,
        slug,
        excerpt,
        content,
        image: image || null,
        category,
        readTime: readTime || 5,
        isPublished,
        publishedAt: isPublished && !existing.isPublished ? new Date() : existing.publishedAt,
        authorId: authorId || existing.authorId,
        relatedArticleIds: relatedArticleIds || [],
        accessType,
        targetAudience,
        updatedAt: new Date(),
      })
      .where(eq(blogArticles.id, articleId))
      .returning()

    // Cache invalidation so users see edits immediately
    revalidateTag('articles')
    revalidateTag('article-slugs')
    revalidateTag(`article-${slug}`)
    revalidatePath('/')
    revalidatePath('/articles')
    revalidatePath(`/articles/${slug}`)
    if (slug !== existing.slug) {
      // Slug changed — also bust the old URL so search-engine-cached references die
      revalidateTag(`article-${existing.slug}`)
      revalidatePath(`/articles/${existing.slug}`)
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar artigo' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ articleId: string }> }
) {
  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) return authResult

    const { articleId } = await context.params

    const article = await db
      .select({ id: blogArticles.id, slug: blogArticles.slug })
      .from(blogArticles)
      .where(eq(blogArticles.id, articleId))
      .limit(1)
      .then((r) => r[0] ?? null)

    if (!article) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 })
    }

    await db.delete(blogArticles).where(eq(blogArticles.id, articleId))

    // Cache invalidation so the deleted article disappears immediately
    revalidateTag('articles')
    revalidateTag('article-slugs')
    revalidateTag(`article-${article.slug}`)
    revalidatePath('/')
    revalidatePath('/articles')
    revalidatePath(`/articles/${article.slug}`)

    return NextResponse.json({ success: true, message: 'Article deleted successfully' })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}


