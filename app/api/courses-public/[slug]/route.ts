import { NextRequest, NextResponse } from 'next/server';
import { sampleCourses } from '@/data/courses';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Find course by slug
    const course = sampleCourses.find(course => course.slug === slug);

    if (!course) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Course not found',
          data: null,
        },
        { status: 404 }
      );
    }

    // Get related courses (same category or instructor, excluding current course)
    const relatedCourses = sampleCourses
      .filter(c => 
        c.slug !== slug && 
        (c.category === course.category || c.instructor.id === course.instructor.id)
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);

    return NextResponse.json({
      success: true,
      data: {
        course,
        relatedCourses,
      },
    });

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
