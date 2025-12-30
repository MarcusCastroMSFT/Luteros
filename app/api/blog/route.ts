import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 1800; // Revalidate every 30 minutes (instead of 5)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Extract query parameters with validation
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12'))); // Max 50 per page
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  try {
    // Build where condition for Prisma query
    const whereCondition: any = {
      isPublished: true, // Only show published articles
    };
    
    // Filter by category
    if (category && category !== 'Todos') {
      whereCondition.category = category;
    }

    // Filter by search term
    if (search) {
      whereCondition.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Execute queries in parallel for performance
    const [articles, totalArticles, allCategories] = await Promise.all([
      prisma.blogArticle.findMany({
        where: whereCondition,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          image: true,
          category: true,
          readTime: true,
          commentCount: true,
          viewCount: true,
          publishedAt: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              fullName: true,
              displayName: true,
              avatar: true,
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogArticle.count({
        where: whereCondition,
      }),
      prisma.blogArticle.findMany({
        where: { isPublished: true },
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' },
      }),
    ]);

    // Transform articles to match frontend interface
    const transformedArticles = articles.map(article => {
      const articleDate = article.publishedAt || article.createdAt;
      const formattedDate = new Intl.DateTimeFormat('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(articleDate));

      return {
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        // Exclude content to reduce payload size and prevent cache overflow
        image: article.image || '',
        category: article.category,
        author: article.author.fullName || article.author.displayName || 'Unknown',
        authorAvatar: article.author.avatar || '/images/default-avatar.jpg',
        authorSlug: '',
        date: formattedDate,
        readTime: `${article.readTime} min`,
        commentCount: article.commentCount,
        viewCount: article.viewCount,
      };
    });

    // Calculate pagination
    const totalPages = Math.ceil(totalArticles / limit);

    // Get unique categories for filter
    const categories = ['Todos', ...allCategories.map(c => c.category)];

    return NextResponse.json({
      success: true,
      data: {
        articles: transformedArticles,
        pagination: {
          currentPage: page,
          totalPages,
          totalArticles,
          articlesPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        categories,
      },
    });

  } catch (error) {
    console.error('Error fetching blog articles:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch articles',
        data: null,
      },
      { status: 500 }
    );
  }
}
