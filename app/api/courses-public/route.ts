import { NextRequest, NextResponse } from 'next/server';
import { getCourses } from '@/lib/courses';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Extract query parameters
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
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

    // Set cache headers for CDN and browser caching
    // Course listings can be cached for a shorter time since they change more often
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=3600'
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
