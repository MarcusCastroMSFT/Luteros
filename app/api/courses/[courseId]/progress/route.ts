import { NextRequest, NextResponse, connection } from 'next/server';
import { and, count, eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { courseProgress, lessonProgress, lessons } from '@/lib/db/schema';

// GET - Get all lesson progress for a course
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  await connection();

  try {
    const { courseId } = await context.params;

    const authUser = await requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    const [completedRows, progress, [{ totalLessons }]] = await Promise.all([
      db
        .select({ lessonId: lessonProgress.lessonId })
        .from(lessonProgress)
        .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
        .where(and(
          eq(lessonProgress.userId, authUser.id),
          eq(lessonProgress.isCompleted, true),
          eq(lessons.courseId, courseId),
          eq(lessons.isPublished, true),
        )),
      db.select().from(courseProgress).where(and(eq(courseProgress.userId, authUser.id), eq(courseProgress.courseId, courseId))).limit(1).then((r) => r[0] ?? null),
      db.select({ totalLessons: count() }).from(lessons).where(and(eq(lessons.courseId, courseId), eq(lessons.isPublished, true))),
    ]);

    const completedLessonIds = completedRows.map((r) => r.lessonId);

    return NextResponse.json({
      success: true,
      data: {
        completedLessonIds,
        completedLessons: completedLessonIds.length,
        totalLessons: Number(totalLessons),
        progressPercent: progress?.progressPercent || 0,
        lastAccessedAt: progress?.lastAccessedAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Error fetching course progress:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar progresso' }, { status: 500 });
  }
}
