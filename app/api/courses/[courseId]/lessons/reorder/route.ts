import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrInstructor } from '@/lib/auth-helpers';
import prisma from '@/lib/prisma';

// PUT reorder lessons
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const authResult = await requireAdminOrInstructor(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const params = await context.params;
    const courseId = params.courseId;

    // Verify course exists
    const course = await prisma.courses.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { lessonIds } = body;

    if (!Array.isArray(lessonIds)) {
      return NextResponse.json(
        { success: false, error: 'lessonIds must be an array' },
        { status: 400 }
      );
    }

    // Verify all lessons belong to this course
    const lessons = await prisma.lessons.findMany({
      where: { 
        courseId,
        id: { in: lessonIds },
      },
      select: { id: true },
    });

    if (lessons.length !== lessonIds.length) {
      return NextResponse.json(
        { success: false, error: 'Some lessons were not found or do not belong to this course' },
        { status: 400 }
      );
    }

    // Update order for all lessons using a transaction
    // First set all to negative values to avoid unique constraint conflicts
    // Then set to the final values
    await prisma.$transaction(async (tx) => {
      // Step 1: Set all orders to negative (temporary) to avoid conflicts
      await Promise.all(
        lessonIds.map((lessonId: string, index: number) =>
          tx.lessons.update({
            where: { id: lessonId },
            data: { order: -(index + 1) }, // Use negative values temporarily
          })
        )
      );

      // Step 2: Set all orders to their final positive values
      await Promise.all(
        lessonIds.map((lessonId: string, index: number) =>
          tx.lessons.update({
            where: { id: lessonId },
            data: { order: index },
          })
        )
      );
    });

    // Fetch updated lessons
    const updatedLessons = await prisma.lessons.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        type: true,
        description: true,
        duration: true,
        order: true,
        sectionTitle: true,
        isPublished: true,
        isFree: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedLessons,
    });
  } catch (error) {
    console.error('Error reordering lessons:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}
