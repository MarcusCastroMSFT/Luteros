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

    // Tagged server data is cached; a separate CDN cache cannot follow tag invalidation.
    response.headers.set(
      'Cache-Control',
      'no-store'
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
