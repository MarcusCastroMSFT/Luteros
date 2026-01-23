import { NextRequest, NextResponse, connection } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// Type for bookmark from Prisma query
interface BookmarkWithArticle {
  id: string;
  articleId: string;
  userId: string;
  createdAt: Date;
  blog_articles: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    image: string | null;
    category: string;
    readTime: number;
    publishedAt: Date | null;
    user_profiles: {
      id: string;
      fullName: string | null;
      displayName: string | null;
      avatar: string | null;
    };
  };
}

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
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Você precisa estar logado para ver seus artigos salvos' },
        { status: 401 }
      );
    }

    // Parse query params for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');

    // Build where condition
    type WhereCondition = {
      userId: string;
      blog_articles?: {
        category: string;
        isPublished: boolean;
      };
    };

    const whereCondition: WhereCondition = {
      userId: user.id,
    };

    if (category) {
      whereCondition.blog_articles = {
        category,
        isPublished: true,
      };
    }

    // Fetch bookmarks with article data
    const [bookmarks, totalCount] = await Promise.all([
      prisma.blog_bookmarks.findMany({
        where: whereCondition,
        include: {
          blog_articles: {
            select: {
              id: true,
              slug: true,
              title: true,
              excerpt: true,
              image: true,
              category: true,
              readTime: true,
              publishedAt: true,
              user_profiles: {
                select: {
                  id: true,
                  fullName: true,
                  displayName: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blog_bookmarks.count({ where: whereCondition }),
    ]);

    // Get unique categories for filter
    const allBookmarks = await prisma.blog_bookmarks.findMany({
      where: { userId: user.id },
      include: {
        blog_articles: {
          select: { category: true },
        },
      },
    });

    const categories = [...new Set(allBookmarks.map((b: { blog_articles: { category: string } }) => b.blog_articles.category))].sort();

    // Transform data for response
    const savedArticles: SavedArticle[] = (bookmarks as BookmarkWithArticle[]).map((bookmark) => {
      const article = bookmark.blog_articles;
      const authorName = article.user_profiles.fullName || article.user_profiles.displayName || 'Autor';

      return {
        id: bookmark.id,
        articleId: article.id,
        savedAt: bookmark.createdAt.toISOString(),
        article: {
          id: article.id,
          slug: article.slug,
          title: article.title,
          excerpt: article.excerpt,
          image: article.image || '/images/article-placeholder.jpg',
          category: article.category,
          readTime: `${article.readTime} min`,
          publishedAt: article.publishedAt?.toISOString() || bookmark.createdAt.toISOString(),
          author: {
            id: article.user_profiles.id,
            name: authorName,
            avatar: article.user_profiles.avatar || '/images/default-avatar.jpg',
          },
        },
      };
    });

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        savedArticles,
        pagination: {
          currentPage: page,
          totalPages,
          totalArticles: totalCount,
          articlesPerPage: limit,
          hasNextPage,
          hasPrevPage,
        },
        categories,
        stats: {
          total: totalCount,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching saved articles:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar artigos salvos' },
      { status: 500 }
    );
  }
}
