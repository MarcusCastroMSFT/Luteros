import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdminOrInstructor } from '@/lib/auth-helpers';
import prisma from '@/lib/prisma';

// GET all lessons for a course
export async function GET(
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

    const lessons = await prisma.lessons.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        type: true,
        description: true,
        content: true,
        videoUrl: true,
        videoProvider: true,
        duration: true,
        order: true,
        sectionTitle: true,
        isPublished: true,
        isFree: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: lessons,
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// POST create a new lesson
export async function POST(
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
    const { 
      title, 
      type = 'video',
      description, 
      content, 
      videoUrl, 
      videoProvider,
      duration, 
      sectionTitle, 
      isPublished = false, 
      isFree = false 
    } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    // Get the next order number
    const maxOrder = await prisma.lessons.aggregate({
      where: { courseId },
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    const lesson = await prisma.lessons.create({
      data: {
        courseId,
        title: title.trim(),
        type,
        description: description?.trim() || null,
        content: content || null,
        videoUrl: videoUrl?.trim() || null,
        videoProvider: videoProvider || null,
        duration: duration ? parseInt(duration) : null,
        sectionTitle: sectionTitle?.trim() || null,
        order: nextOrder,
        isPublished,
        isFree,
      },
    });

    // Get course slug to revalidate cache
    const courseForCache = await prisma.courses.findUnique({
      where: { id: courseId },
      select: { slug: true },
    });

    // Revalidate course cache
    if (courseForCache?.slug) {
      revalidateTag(`course-${courseForCache.slug}`, {});
    }
    revalidateTag('courses', {});
    revalidateTag('courses-initial', {});

    return NextResponse.json({
      success: true,
      data: lesson,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
