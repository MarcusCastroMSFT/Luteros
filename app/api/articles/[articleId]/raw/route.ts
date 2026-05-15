import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { blogArticles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ articleId: string }> }
) {
  try {
    const authUser = await requireAuth(request);
    if (authUser instanceof NextResponse) {
      return authUser;
    }

    const params = await context.params;
    const articleId = params.articleId;

    const article = await db
      .select()
      .from(blogArticles)
      .where(eq(blogArticles.id, articleId))
      .limit(1)
      .then((r) => r[0] ?? null);

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        image: article.image,
        category: article.category,
        readTime: article.readTime,
        isPublished: article.isPublished,
        authorId: article.authorId,
        relatedArticleIds: article.relatedArticleIds || [],
        accessType: article.accessType || 'free',
        targetAudience: article.targetAudience || 'general',
        commentCount: article.commentCount,
        publishedAt: article.publishedAt,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching raw article:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
