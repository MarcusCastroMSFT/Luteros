import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrInstructor } from '@/lib/auth-helpers';
import prisma from '@/lib/prisma';

// GET raw course data for editing (without transformation)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    // Require authentication and authorization (admin or instructor only)
    const authResult = await requireAdminOrInstructor(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Return 401/403 response
    }
    
    // In Next.js 15, params is a Promise
    const params = await context.params;
    const courseId = params.courseId;

    // Fetch raw course data
    const course = await prisma.courses.findUnique({
      where: { id: courseId },
      include: {
        user_profiles: {
          select: {
            id: true,
            fullName: true,
            displayName: true,
            avatar: true,
          },
        },
        lessons: {
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
            order: true,
            sectionTitle: true,
            isPublished: true,
            isFree: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Return raw data with Decimal fields converted to numbers
    const rawCourse = {
      ...course,
      price: course.price ? parseFloat(course.price.toString()) : null,
      discountPrice: course.discountPrice ? parseFloat(course.discountPrice.toString()) : null,
      averageRating: course.averageRating ? parseFloat(course.averageRating.toString()) : null,
    };

    return NextResponse.json({
      success: true,
      data: rawCourse,
    });
  } catch (error) {
    console.error('Error fetching raw course:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
