import { NextRequest, NextResponse, connection } from 'next/server';
import { and, desc, eq, count } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { blogBookmarks, blogArticles, users } from '@/lib/db/schema';

// Type for saved article (API response)
export interface SavedArticle {
  id: string;
  articleId: string;
  savedAt: string;
  article: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    image: string;
    category: string;
    readTime: string;
    publishedAt: string;
    author: {
      id: string;
      name: string;
      avatar: string;
    };
  };
}

export async function GET(request: NextRequest) {
  await connection();

  try {
    const authUser = await requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;
    const userId = authUser.id;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');

    const baseWhere = and(
      eq(blogBookmarks.userId, userId),
      eq(blogArticles.isPublished, true),
      category ? eq(blogArticles.category, category) : undefined,
    );

    const [bookmarks, [{ total }], allCategories] = await Promise.all([
      db
        .select({
          id: blogBookmarks.id,
          articleId: blogBookmarks.articleId,
          savedAt: blogBookmarks.createdAt,
          articleSlug: blogArticles.slug,
          articleTitle: blogArticles.title,
          articleExcerpt: blogArticles.excerpt,
          articleImage: blogArticles.image,
          articleCategory: blogArticles.category,
          articleReadTime: blogArticles.readTime,
          articlePublishedAt: blogArticles.publishedAt,
          authorId: users.id,
          authorName: users.name,
          authorDisplayName: users.displayName,
          authorAvatar: users.image,
        })
        .from(blogBookmarks)
        .innerJoin(blogArticles, eq(blogBookmarks.articleId, blogArticles.id))
        .innerJoin(users, eq(blogArticles.authorId, users.id))
        .where(baseWhere)
        .orderBy(desc(blogBookmarks.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db
        .select({ total: count() })
        .from(blogBookmarks)
        .innerJoin(blogArticles, eq(blogBookmarks.articleId, blogArticles.id))
        .where(baseWhere),
      db
        .select({ category: blogArticles.category })
        .from(blogBookmarks)
        .innerJoin(blogArticles, eq(blogBookmarks.articleId, blogArticles.id))
        .where(and(eq(blogBookmarks.userId, userId), eq(blogArticles.isPublished, true))),
    ]);

    const categories = [...new Set(allCategories.map((b) => b.category))].sort();

    const savedArticles: SavedArticle[] = bookmarks.map((bookmark) => {
      const authorName = bookmark.authorName || bookmark.authorDisplayName || 'Autor';
      return {
        id: bookmark.id,
        articleId: bookmark.articleId,
        savedAt: bookmark.savedAt.toISOString(),
        article: {
          id: bookmark.articleId,
          slug: bookmark.articleSlug,
          title: bookmark.articleTitle,
          excerpt: bookmark.articleExcerpt,
          image: bookmark.articleImage || '/images/article-placeholder.jpg',
          category: bookmark.articleCategory,
          readTime: `${bookmark.articleReadTime} min`,
          publishedAt: bookmark.articlePublishedAt?.toISOString() || bookmark.savedAt.toISOString(),
          author: {
            id: bookmark.authorId,
            name: authorName,
            avatar: bookmark.authorAvatar || '/images/default-avatar.jpg',
          },
        },
      };
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        savedArticles,
        pagination: {
          currentPage: page,
          totalPages,
          totalArticles: total,
          articlesPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        categories,
        stats: { total },
      },
    });
  } catch (error) {
    console.error('Error fetching saved articles:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar artigos salvos' },
      { status: 500 },
    );
  }
}
