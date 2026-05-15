import { NextRequest, NextResponse, connection } from 'next/server';
import { revalidateTag } from '@/lib/cache';
import { and, eq, sql } from 'drizzle-orm';
import { getAuthUser, requireAuth } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { courses, enrollments } from '@/lib/db/schema';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  // Signal that this route uses request-specific data (auth cookies)
  await connection();

  try {
    const { courseId } = await context.params;

    const authUser = await requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    const [course, existing] = await Promise.all([
      db.select().from(courses).where(eq(courses.id, courseId)).limit(1).then((r) => r[0] ?? null),
      db.select({ id: enrollments.id }).from(enrollments).where(and(eq(enrollments.userId, authUser.id), eq(enrollments.courseId, courseId))).limit(1).then((r) => r[0] ?? null),
    ]);

    if (!course) return NextResponse.json({ success: false, error: 'Curso não encontrado' }, { status: 404 });
    if (!course.isPublished) return NextResponse.json({ success: false, error: 'Este curso não está disponível' }, { status: 400 });
    if (existing) return NextResponse.json({ success: false, error: 'Você já está inscrito neste curso' }, { status: 400 });

    const isPaid = !course.isFree && course.price && Number(course.price) > 0;

    const [enrollment] = await db.insert(enrollments).values({
      userId: authUser.id,
      courseId,
      paidAmount: isPaid ? course.price : '0',
      paymentStatus: isPaid ? 'PENDING' : 'COMPLETED',
    }).returning();

    await db.update(courses).set({ enrollmentCount: sql`${courses.enrollmentCount} + 1` }).where(eq(courses.id, courseId));

    revalidateTag('courses');
    revalidateTag(`course-${course.slug}`);

    return NextResponse.json({
      success: true,
      message: isPaid ? 'Inscrição realizada! Em breve implementaremos o pagamento.' : 'Você foi inscrito no curso com sucesso!',
      enrollment: { id: enrollment.id, enrolledAt: enrollment.enrolledAt, courseId: enrollment.courseId, courseTitle: course.title, courseSlug: course.slug },
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json({ success: false, error: 'Erro ao se inscrever no curso' }, { status: 500 });
  }
}

// GET - Check if user is enrolled in a course
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  // Signal that this route uses request-specific data (auth cookies)
  await connection();

  try {
    const { courseId } = await context.params;

    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ success: true, isEnrolled: false, enrollment: null });

    const enrollment = await db.select({ id: enrollments.id, enrolledAt: enrollments.enrolledAt, progressPercent: enrollments.progressPercent, paymentStatus: enrollments.paymentStatus }).from(enrollments).where(and(eq(enrollments.userId, authUser.id), eq(enrollments.courseId, courseId))).limit(1).then((r) => r[0] ?? null);

    return NextResponse.json({ success: true, isEnrolled: !!enrollment, enrollment });
  } catch (error) {
    console.error('Error checking enrollment:', error);
    return NextResponse.json({ success: false, error: 'Erro ao verificar inscrição' }, { status: 500 });
  }
}
