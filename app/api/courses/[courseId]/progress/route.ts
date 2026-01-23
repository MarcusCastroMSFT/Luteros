import { NextRequest, NextResponse, connection } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// GET - Get all lesson progress for a course
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  await connection();

  try {
    const { courseId } = await context.params;

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Você precisa estar logado' },
        { status: 401 }
      );
    }

    // Get all lesson progress for this course
    const [lessonProgress, courseProgress, totalLessons] = await Promise.all([
      prisma.lesson_progress.findMany({
        where: {
          userId: user.id,
          lessons: {
            courseId,
            isPublished: true,
          },
        },
        select: {
          lessonId: true,
          isCompleted: true,
          completedAt: true,
        },
      }),
      prisma.course_progress.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId,
          },
        },
      }),
      prisma.lessons.count({
        where: {
          courseId,
          isPublished: true,
        },
      }),
    ]);

    // Type for lesson progress item
    type LessonProgressItem = {
      lessonId: string;
      isCompleted: boolean;
      completedAt: Date | null;
    };

    // Create a map of completed lesson IDs
    const completedLessonIds = (lessonProgress as LessonProgressItem[])
      .filter((lp) => lp.isCompleted)
      .map((lp) => lp.lessonId);

    return NextResponse.json({
      success: true,
      data: {
        completedLessonIds,
        completedLessons: completedLessonIds.length,
        totalLessons,
        progressPercent: courseProgress?.progressPercent || 0,
        lastAccessedAt: courseProgress?.lastAccessedAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Error fetching course progress:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar progresso' },
      { status: 500 }
    );
  }
}
