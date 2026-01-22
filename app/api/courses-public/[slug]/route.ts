import { NextRequest, NextResponse } from 'next/server';
import { getCourseBySlug } from '@/lib/courses';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params;

    // Use the cached getCourseBySlug function from lib/courses.ts
    const result = await getCourseBySlug(slug);

    if (!result) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Course not found',
          data: null,
        },
        { status: 404 }
      );
    }

    // Create response with cache headers
    const response = NextResponse.json({
      success: true,
      data: {
        course: result.course,
        lessons: result.lessons,
        relatedCourses: result.relatedCourses,
      },
    });

    // Set cache headers for CDN and browser caching
    // stale-while-revalidate allows serving stale content while fetching fresh data
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=86400'
    );

    return response;

  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch course',
        data: null,
      },
      { status: 500 }
    );
  }
}
