import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import prisma from '@/lib/prisma';

// Configure route segment to enable caching
export const dynamic = 'force-dynamic' // Required for auth
export const revalidate = 60 // Revalidate every 60 seconds

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

    // Fetch article with author details (optimized query)
    const article = await prisma.blogArticle.findUnique({
      where: { id: articleId },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    // Format date in Portuguese
    const articleDate = article.publishedAt || article.createdAt;
    const formattedDate = new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(articleDate));

    // Transform to match frontend Article type
    const transformedArticle = {
      id: article.id,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      image: article.image || '',
      category: article.category,
      author: {
        name: article.author.fullName || 'Unknown',
        avatar: article.author.avatar || '/images/default-avatar.jpg',
      },
      date: formattedDate,
      readTime: `${article.readTime} min`,
      commentCount: article.commentCount,
      viewCount: article.viewCount,
      status: article.isPublished ? 'published' : 'draft',
    };

    return NextResponse.json({
      success: true,
      data: transformedArticle,
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Parse request body
    const body = await request.json();
    const { title, slug, excerpt, content, image, category, readTime, isPublished, authorId, relatedArticleIds = [], accessType = 'free', targetAudience = 'general' } = body;

    // Validation
    if (!title || !slug || !excerpt || !content || !category) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Validate relatedArticleIds (max 3)
    if (relatedArticleIds && relatedArticleIds.length > 3) {
      return NextResponse.json(
        { success: false, error: 'Máximo de 3 artigos relacionados permitidos' },
        { status: 400 }
      );
    }

    // Check if article exists
    const existingArticle = await prisma.blogArticle.findUnique({
      where: { id: articleId },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { success: false, error: 'Artigo não encontrado' },
        { status: 404 }
      );
    }

    // Check if slug is being changed and if it conflicts with another article
    if (slug !== existingArticle.slug) {
      const slugConflict = await prisma.blogArticle.findUnique({
        where: { slug },
      });

      if (slugConflict) {
        return NextResponse.json(
          { success: false, error: 'Já existe um artigo com esse slug' },
          { status: 400 }
        );
      }
    }

    // Update article
    const updatedArticle = await prisma.blogArticle.update({
      where: { id: articleId },
      data: {
        title,
        slug,
        excerpt,
        content,
        image: image || null,
        category,
        readTime: readTime || 5,
        isPublished,
        publishedAt: isPublished && !existingArticle.isPublished ? new Date() : existingArticle.publishedAt,
        authorId: authorId || existingArticle.authorId,
        relatedArticleIds: relatedArticleIds || [],
        accessType,
        targetAudience,
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
    });

    return NextResponse.json({
      success: true,
      data: updatedArticle,
    });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar artigo' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check if article exists
    const article = await prisma.blogArticle.findUnique({
      where: { id: articleId },
      select: { id: true, title: true },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    // Delete the article (cascade will handle related records)
    await prisma.blogArticle.delete({
      where: { id: articleId },
    });

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
