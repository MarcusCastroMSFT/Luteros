import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { blogArticles, users } from '@/lib/db/schema'
import { and, eq, inArray, ne, sql } from 'drizzle-orm'

interface Props {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params

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
      isPublished: blogArticles.isPublished,
      publishedAt: blogArticles.publishedAt,
      createdAt: blogArticles.createdAt,
      relatedArticleIds: blogArticles.relatedArticleIds,
      authorId: users.id,
      authorName: users.name,
      authorDisplayName: users.displayName,
      authorAvatar: users.image,
    }

    const row = await db
      .select(articleCols)
      .from(blogArticles)
      .innerJoin(users, eq(blogArticles.authorId, users.id))
      .where(and(eq(blogArticles.slug, slug), eq(blogArticles.isPublished, true)))
      .limit(1)
      .then((r) => r[0] ?? null)

    if (!row) {
      return NextResponse.json(
        { success: false, error: 'Article not found', data: null },
        { status: 404 }
      )
    }

    let relatedRows: (typeof row)[] = []
    if (row.relatedArticleIds && row.relatedArticleIds.length > 0) {
      relatedRows = await db
        .select(articleCols)
        .from(blogArticles)
        .innerJoin(users, eq(blogArticles.authorId, users.id))
        .where(and(inArray(blogArticles.id, row.relatedArticleIds), eq(blogArticles.isPublished, true)))
        .limit(3)
    }

    if (relatedRows.length < 3) {
      const additional = await db
        .select(articleCols)
        .from(blogArticles)
        .innerJoin(users, eq(blogArticles.authorId, users.id))
        .where(
          and(
            eq(blogArticles.category, row.category),
            eq(blogArticles.isPublished, true),
            ne(blogArticles.id, row.id),
          )
        )
        .orderBy(sql`${blogArticles.publishedAt} desc nulls last`)
        .limit(3)
      const existingIds = new Set(relatedRows.map((r) => r.id))
      const filtered = additional.filter((a) => !existingIds.has(a.id))
      relatedRows = [...relatedRows, ...filtered.slice(0, 3 - relatedRows.length)]
    }

    const formatDate = (d: Date) =>
      new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)

    const transformRow = (r: typeof row) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      content: r.content,
      image: r.image || '',
      category: r.category,
      author: r.authorName || r.authorDisplayName || 'Unknown',
      authorAvatar: r.authorAvatar || '/images/default-avatar.jpg',
      authorSlug: '',
      date: formatDate(new Date(r.publishedAt || r.createdAt)),
      readTime: `${r.readTime} min`,
      commentCount: r.commentCount,
    })

    return NextResponse.json({
      success: true,
      data: {
        article: transformRow(row),
        relatedArticles: relatedRows.map(transformRow),
      },
    })
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch article', data: null },
      { status: 500 }
    )
  }
}

