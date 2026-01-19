import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ articleId: string }> }
) {
  try {
    // Require authentication
    const authUser = await requireAuth(request);
    if (authUser instanceof NextResponse) {
      return authUser; // Return 401 response
    }
    
    // In Next.js 15, params is a Promise
    const params = await context.params;
    const articleId = params.articleId;

    // Fetch article with all raw data
    const article = await prisma.blogArticle.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    // Return raw article data including authorId, relatedArticleIds, accessType and targetAudience
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
