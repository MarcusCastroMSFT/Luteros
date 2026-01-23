import { NextRequest, NextResponse, connection } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { Prisma } from '@prisma/client';

type TransactionClient = Prisma.TransactionClient;

// POST - Mark lesson as complete/incomplete
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  await connection();

  try {
    const { courseId, lessonId } = await context.params;

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Você precisa estar logado' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { isCompleted } = body;

    if (typeof isCompleted !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Campo isCompleted é obrigatório' },
        { status: 400 }
      );
    }

    // Parallelize validation queries for better performance
    const [enrollment, lesson, totalLessons] = await Promise.all([
      prisma.enrollments.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId,
          },
        },
        select: { id: true }, // Only select what we need
      }),
      prisma.lessons.findFirst({
        where: {
          id: lessonId,
          courseId,
          isPublished: true,
        },
        select: { id: true }, // Only select what we need
      }),
      prisma.lessons.count({
        where: {
          courseId,
          isPublished: true,
        },
      }),
    ]);

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Você não está inscrito neste curso' },
        { status: 403 }
      );
    }

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: 'Aula não encontrada' },
        { status: 404 }
      );
    }

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (tx: TransactionClient) => {
      // Upsert lesson progress
      const lessonProgress = await tx.lesson_progress.upsert({
        where: {
          userId_lessonId: {
            userId: user.id,
            lessonId,
          },
        },
        update: {
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
          updatedAt: new Date(),
        },
        create: {
          userId: user.id,
          lessonId,
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
          updatedAt: new Date(),
        },
      });

      // Count completed lessons for this course
      const completedLessonsCount = await tx.lesson_progress.count({
        where: {
          userId: user.id,
          isCompleted: true,
          lessons: {
            courseId,
            isPublished: true,
          },
        },
      });

      // Calculate progress percentage
      const progressPercent = totalLessons > 0 
        ? Math.round((completedLessonsCount / totalLessons) * 100) 
        : 0;

      // Upsert course progress
      const courseProgress = await tx.course_progress.upsert({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId,
          },
        },
        update: {
          completedLessons: completedLessonsCount,
          totalLessons,
          progressPercent,
          lastAccessedAt: new Date(),
          updatedAt: new Date(),
        },
        create: {
          userId: user.id,
          courseId,
          completedLessons: completedLessonsCount,
          totalLessons,
          progressPercent,
          lastAccessedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Also update enrollment progress
      await tx.enrollments.update({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId,
          },
        },
        data: {
          progressPercent,
          completedAt: progressPercent === 100 ? new Date() : null,
        },
      });

      return { lessonProgress, courseProgress, completedLessonsCount };
    });

    return NextResponse.json({
      success: true,
      data: {
        lessonId,
        isCompleted,
        completedLessons: result.completedLessonsCount,
        totalLessons,
        progressPercent: result.courseProgress.progressPercent,
      },
      message: isCompleted ? 'Aula marcada como concluída' : 'Aula desmarcada',
    });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar progresso' },
      { status: 500 }
    );
  }
}

// GET - Get lesson progress status
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  await connection();

  try {
    const { courseId, lessonId } = await context.params;

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Você precisa estar logado' },
        { status: 401 }
      );
    }

    const lessonProgress = await prisma.lesson_progress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        lessonId,
        isCompleted: lessonProgress?.isCompleted || false,
        completedAt: lessonProgress?.completedAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar progresso' },
      { status: 500 }
    );
  }
}
