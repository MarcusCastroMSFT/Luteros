import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params;

    // Fetch published article by slug from database
    const article = await prisma.blog_articles.findFirst({
      where: { 
        slug,
        isPublished: true, // Only show published articles
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        image: true,
        category: true,
        readTime: true,
        commentCount: true,
        isPublished: true,
        publishedAt: true,
        createdAt: true,
        relatedArticleIds: true, // Explicitly include related article IDs
        user_profiles: {
          select: {
            id: true,
            fullName: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Article not found',
          data: null,
        },
        { status: 404 }
      );
    }

    // Get related articles - prioritize manually selected ones, fallback to same category
    let relatedArticles: Array<{
      id: string;
      title: string;
      slug: string;
      excerpt: string;
      content: string;
      image: string | null;
      category: string;
      readTime: number;
      commentCount: number;
      publishedAt: Date | null;
      createdAt: Date;
      user_profiles: {
        id: string;
        fullName: string | null;
        displayName: string | null;
        avatar: string | null;
      };
    }> = [];
    
    if (article.relatedArticleIds && article.relatedArticleIds.length > 0) {
      // Fetch manually selected related articles
      relatedArticles = await prisma.blog_articles.findMany({
        where: {
          id: { in: article.relatedArticleIds },
          isPublished: true,
        },
        take: 3,
        include: {
          user_profiles: {
            select: {
              id: true,
              fullName: true,
              displayName: true,
              avatar: true,
            },
          },
        },
      });
    }
    
    // If we don't have 3 related articles, fill with same category articles
    if (relatedArticles.length < 3) {
      const additionalArticles = await prisma.blog_articles.findMany({
        where: {
          category: article.category,
          slug: { not: slug },
          id: { notIn: relatedArticles.map((a: { id: string }) => a.id) },
          isPublished: true,
        },
        take: 3 - relatedArticles.length,
        orderBy: { publishedAt: 'desc' },
        include: {
          user_profiles: {
            select: {
              id: true,
              fullName: true,
              displayName: true,
              avatar: true,
            },
          },
        },
      });
      
      relatedArticles = [...relatedArticles, ...additionalArticles];
    }

    // Format article date
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
      author: article.user_profiles.fullName || article.user_profiles.displayName || 'Unknown',
      authorAvatar: article.user_profiles.avatar || '/images/default-avatar.jpg',
      authorSlug: '',
      date: formattedDate,
      readTime: `${article.readTime} min`,
      commentCount: article.commentCount,
    };

    // Define type for related articles from Prisma query
    type RelatedArticle = {
      id: string
      slug: string
      title: string
      excerpt: string | null
      content: string | null
      image: string | null
      category: string
      readTime: number
      commentCount: number
      publishedAt: Date | null
      createdAt: Date
      user_profiles: {
        id: string
        fullName: string | null
        displayName: string | null
        avatar: string | null
      }
    }

    // Transform related articles
    const transformedRelatedArticles = relatedArticles.map((rel: RelatedArticle) => {
      const relDate = rel.publishedAt || rel.createdAt;
      const relFormattedDate = new Intl.DateTimeFormat('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(relDate));

      return {
        id: rel.id,
        slug: rel.slug,
        title: rel.title,
        excerpt: rel.excerpt,
        content: rel.content,
        image: rel.image || '',
        category: rel.category,
        author: rel.user_profiles.fullName || rel.user_profiles.displayName || 'Unknown',
        authorAvatar: rel.user_profiles.avatar || '/images/default-avatar.jpg',
        authorSlug: '',
        date: relFormattedDate,
        readTime: `${rel.readTime} min`,
        commentCount: rel.commentCount,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        article: transformedArticle,
        relatedArticles: transformedRelatedArticles,
      },
    });

  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch article',
        data: null,
      },
      { status: 500 }
    );
  }
}
