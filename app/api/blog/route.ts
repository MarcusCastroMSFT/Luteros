import { NextRequest, NextResponse } from 'next/server';
import { sampleArticles } from '@/data/articles';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Extract query parameters
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Filter articles by category
    let filteredArticles = [...sampleArticles];
    
    if (category && category !== 'Todos') {
      filteredArticles = filteredArticles.filter(article => 
        article.category === category
      );
    }

    // Filter by search term
    if (search) {
      filteredArticles = filteredArticles.filter(article =>
        article.title.toLowerCase().includes(search.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        article.author.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort by date (newest first)
    filteredArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply pagination
    const totalArticles = filteredArticles.length;
    const totalPages = Math.ceil(totalArticles / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

    // Get unique categories for filter
    const categories = ['Todos', ...Array.from(new Set(sampleArticles.map(article => article.category)))];

    return NextResponse.json({
      success: true,
      data: {
        articles: paginatedArticles,
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
