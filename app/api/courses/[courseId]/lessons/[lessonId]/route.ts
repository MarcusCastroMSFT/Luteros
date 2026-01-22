import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdminOrInstructor } from '@/lib/auth-helpers';
import prisma from '@/lib/prisma';

// GET a single lesson
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const authResult = await requireAdminOrInstructor(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const params = await context.params;
    const { courseId, lessonId } = params;

    const lesson = await prisma.lessons.findFirst({
      where: { 
        id: lessonId,
        courseId,
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update a lesson
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const authResult = await requireAdminOrInstructor(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const params = await context.params;
    const { courseId, lessonId } = params;

    // Verify lesson exists and belongs to course
    const existingLesson = await prisma.lessons.findFirst({
      where: { 
        id: lessonId,
        courseId,
      },
    });

    if (!existingLesson) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { 
      title, 
      type,
      description, 
      content, 
      videoUrl, 
      videoProvider,
      duration, 
      sectionTitle, 
      isPublished, 
      isFree 
    } = body;

    if (title !== undefined && !title?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title cannot be empty' },
        { status: 400 }
      );
    }

    const lesson = await prisma.lessons.update({
      where: { id: lessonId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(type !== undefined && { type }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(content !== undefined && { content: content || null }),
        ...(videoUrl !== undefined && { videoUrl: videoUrl?.trim() || null }),
        ...(videoProvider !== undefined && { videoProvider: videoProvider || null }),
        ...(duration !== undefined && { duration: duration ? parseInt(duration) : null }),
        ...(sectionTitle !== undefined && { sectionTitle: sectionTitle?.trim() || null }),
        ...(isPublished !== undefined && { isPublished }),
        ...(isFree !== undefined && { isFree }),
      },
    });

    // Get course slug to revalidate cache
    const course = await prisma.courses.findUnique({
      where: { id: courseId },
      select: { slug: true },
    });

    // Revalidate course cache
    if (course?.slug) {
      revalidateTag(`course-${course.slug}`, {});
    }
    revalidateTag('courses', {});
    revalidateTag('courses-initial', {});

    return NextResponse.json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE a lesson
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const authResult = await requireAdminOrInstructor(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const params = await context.params;
    const { courseId, lessonId } = params;

    // Verify lesson exists and belongs to course
    const existingLesson = await prisma.lessons.findFirst({
      where: { 
        id: lessonId,
        courseId,
      },
    });

    if (!existingLesson) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Delete the lesson
    await prisma.lessons.delete({
      where: { id: lessonId },
    });

    // Get course slug to revalidate cache
    const course = await prisma.courses.findUnique({
      where: { id: courseId },
      select: { slug: true },
    });

    // Revalidate course cache
    if (course?.slug) {
      revalidateTag(`course-${course.slug}`, {});
    }
    revalidateTag('courses', {});
    revalidateTag('courses-initial', {});

    // Reorder remaining lessons
    const remainingLessons = await prisma.lessons.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      select: { id: true },
    });

    // Update order for all remaining lessons
    await Promise.all(
      remainingLessons.map((lesson: { id: string }, index: number) =>
        prisma.lessons.update({
          where: { id: lesson.id },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
