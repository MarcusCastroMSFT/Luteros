import { NextRequest, NextResponse } from 'next/server';
import { getCourses } from '@/lib/courses';
import { CATALOG_PAGE_SIZE } from '@/lib/catalog-pagination';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Extract query parameters
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || String(CATALOG_PAGE_SIZE));
  const category = searchParams.get('category') || undefined;

  try {
    // Use the cached getCourses function from lib/courses.ts
    const result = await getCourses(page, limit, category);

    // Create response with cache headers
    const response = NextResponse.json({
      success: true,
      data: {
        courses: result.courses,
        pagination: result.pagination,
        categories: result.categories,
        levels: ['Todos', 'Iniciante', 'Intermediário', 'Avançado'],
      },
    });

    // Tagged server data is cached; a separate CDN cache cannot follow tag invalidation.
    response.headers.set(
      'Cache-Control',
      'no-store'
    );

    return response;

  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch courses',
        data: null,
      },
      { status: 500 }
    );
  }
}
