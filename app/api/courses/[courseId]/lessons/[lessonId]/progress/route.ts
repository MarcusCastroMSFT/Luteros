import { NextRequest, NextResponse, connection } from 'next/server';
import { and, count, eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { courseProgress, enrollments, lessonProgress, lessons } from '@/lib/db/schema';

// POST - Mark lesson as complete/incomplete
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  await connection();

  try {
    const { courseId, lessonId } = await context.params;

    const authUser = await requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    const body = await request.json();
    const { isCompleted } = body;

    if (typeof isCompleted !== 'boolean') return NextResponse.json({ success: false, error: 'Campo isCompleted é obrigatório' }, { status: 400 });

    const [enrollment, lesson, [{ total }]] = await Promise.all([
      db.select({ id: enrollments.id }).from(enrollments).where(and(eq(enrollments.userId, authUser.id), eq(enrollments.courseId, courseId))).limit(1).then((r) => r[0] ?? null),
      db.select({ id: lessons.id }).from(lessons).where(and(eq(lessons.id, lessonId), eq(lessons.courseId, courseId), eq(lessons.isPublished, true))).limit(1).then((r) => r[0] ?? null),
      db.select({ total: count() }).from(lessons).where(and(eq(lessons.courseId, courseId), eq(lessons.isPublished, true))),
    ]);

    if (!enrollment) return NextResponse.json({ success: false, error: 'Você não está inscrito neste curso' }, { status: 403 });
    if (!lesson) return NextResponse.json({ success: false, error: 'Aula não encontrada' }, { status: 404 });

    const totalLessons = Number(total);

    // Upsert lesson progress
    const existing = await db.select().from(lessonProgress).where(and(eq(lessonProgress.userId, authUser.id), eq(lessonProgress.lessonId, lessonId))).limit(1).then((r) => r[0] ?? null);
    if (existing) {
      await db.update(lessonProgress).set({ isCompleted, completedAt: isCompleted ? new Date() : null, updatedAt: new Date() }).where(and(eq(lessonProgress.userId, authUser.id), eq(lessonProgress.lessonId, lessonId)));
    } else {
      await db.insert(lessonProgress).values({ userId: authUser.id, lessonId, isCompleted, completedAt: isCompleted ? new Date() : null });
    }

    // Count completed lessons
    const [{ completedCount }] = await db
      .select({ completedCount: count() })
      .from(lessonProgress)
      .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
      .where(and(eq(lessonProgress.userId, authUser.id), eq(lessonProgress.isCompleted, true), eq(lessons.courseId, courseId), eq(lessons.isPublished, true)));

    const completedLessonsCount = Number(completedCount);
    const progressPercent = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

    // Upsert course progress
    const cp = await db.select().from(courseProgress).where(and(eq(courseProgress.userId, authUser.id), eq(courseProgress.courseId, courseId))).limit(1).then((r) => r[0] ?? null);
    if (cp) {
      await db.update(courseProgress).set({ completedLessons: completedLessonsCount, totalLessons, progressPercent, lastAccessedAt: new Date(), updatedAt: new Date() }).where(and(eq(courseProgress.userId, authUser.id), eq(courseProgress.courseId, courseId)));
    } else {
      await db.insert(courseProgress).values({ userId: authUser.id, courseId, completedLessons: completedLessonsCount, totalLessons, progressPercent, lastAccessedAt: new Date() });
    }

    await db.update(enrollments).set({ progressPercent, completedAt: progressPercent === 100 ? new Date() : null }).where(and(eq(enrollments.userId, authUser.id), eq(enrollments.courseId, courseId)));

    return NextResponse.json({
      success: true,
      data: { lessonId, isCompleted, completedLessons: completedLessonsCount, totalLessons, progressPercent },
      message: isCompleted ? 'Aula marcada como concluída' : 'Aula desmarcada',
    });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    return NextResponse.json({ success: false, error: 'Erro ao atualizar progresso' }, { status: 500 });
  }
}

// GET - Get lesson progress status
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  await connection();

  try {
    const { lessonId } = await context.params;

    const authUser = await requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    const lp = await db.select().from(lessonProgress).where(and(eq(lessonProgress.userId, authUser.id), eq(lessonProgress.lessonId, lessonId))).limit(1).then((r) => r[0] ?? null);

    return NextResponse.json({
      success: true,
      data: { lessonId, isCompleted: lp?.isCompleted || false, completedAt: lp?.completedAt?.toISOString() || null },
    });
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar progresso' }, { status: 500 });
  }
}
