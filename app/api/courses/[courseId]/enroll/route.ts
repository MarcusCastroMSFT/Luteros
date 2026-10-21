import { NextRequest, NextResponse, connection } from 'next/server';
import { revalidateTag } from '@/lib/cache';
import { and, eq, sql } from 'drizzle-orm';
import { getAuthUser, requireAuth } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { courses, enrollments } from '@/lib/db/schema';
import { getCourseChargeAmount } from '@/lib/course-pricing';
import { CheckoutError, startCoursePayment, syncEnrollmentPayment } from '@/lib/course-payments.server';
import { hasPaidAccess } from '@/lib/payment-status';

const enrollmentColumns = {
  id: enrollments.id,
  courseId: enrollments.courseId,
  enrolledAt: enrollments.enrolledAt,
  progressPercent: enrollments.progressPercent,
  paymentStatus: enrollments.paymentStatus,
  asaasPaymentId: enrollments.asaasPaymentId,
  paymentUrl: enrollments.paymentUrl,
  paidAmount: enrollments.paidAmount,
};

function isUniqueViolation(error: unknown): boolean {
  const pgError = error as { code?: string; cause?: { code?: string } } | null;
  return pgError?.code === '23505' || pgError?.cause?.code === '23505';
}

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

    const body = await request.json().catch(() => ({})) as { cpfCnpj?: unknown };
    const cpfCnpj = typeof body.cpfCnpj === 'string' && body.cpfCnpj.trim() ? body.cpfCnpj : undefined;

    const [course, existing] = await Promise.all([
      db.select().from(courses).where(eq(courses.id, courseId)).limit(1).then((r) => r[0] ?? null),
      db.select(enrollmentColumns).from(enrollments).where(and(eq(enrollments.userId, authUser.id), eq(enrollments.courseId, courseId))).limit(1).then((r) => r[0] ?? null),
    ]);

    if (!course) return NextResponse.json({ success: false, error: 'Curso não encontrado' }, { status: 404 });
    if (!course.isPublished) return NextResponse.json({ success: false, error: 'Este curso não está disponível' }, { status: 400 });
    if (existing && hasPaidAccess(existing.paymentStatus)) {
      return NextResponse.json({ success: false, error: 'Você já está inscrito neste curso' }, { status: 400 });
    }

    const amount = getCourseChargeAmount(course);

    if (amount > 0) {
      const checkout = await startCoursePayment({ userId: authUser.id, course, existing, cpfCnpj });

      if (checkout.alreadyPaid) {
        revalidateTag('courses');
        revalidateTag(`course-${course.slug}`);
        return NextResponse.json({ success: false, error: 'Você já está inscrito neste curso' }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        requiresPayment: true,
        checkoutUrl: checkout.paymentUrl,
        message: 'Você será redirecionado para concluir o pagamento.',
        enrollment: { id: checkout.enrollmentId, courseId: course.id, courseTitle: course.title, courseSlug: course.slug },
      });
    }

    const [enrollment] = await db.insert(enrollments).values({
      userId: authUser.id,
      courseId,
      paidAmount: '0',
      paymentStatus: 'COMPLETED',
    }).returning();

    await db.update(courses).set({ enrollmentCount: sql`${courses.enrollmentCount} + 1` }).where(eq(courses.id, courseId));

    revalidateTag('courses');
    revalidateTag(`course-${course.slug}`);

    return NextResponse.json({
      success: true,
      requiresPayment: false,
      message: 'Você foi inscrito no curso com sucesso!',
      enrollment: { id: enrollment.id, enrolledAt: enrollment.enrolledAt, courseId: enrollment.courseId, courseTitle: course.title, courseSlug: course.slug },
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ success: false, error: error.message, code: error.code }, { status: error.status });
    }
    if (isUniqueViolation(error)) {
      return NextResponse.json({ success: false, error: 'Você já está inscrito neste curso' }, { status: 400 });
    }
    console.error('Error enrolling in course:', error);
    return NextResponse.json({ success: false, error: 'Erro ao se inscrever no curso' }, { status: 500 });
  }
}

// GET - Check enrollment and (for paid courses) reconcile a pending payment with Asaas
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  // Signal that this route uses request-specific data (auth cookies)
  await connection();

  try {
    const { courseId } = await context.params;

    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ success: true, isEnrolled: false, isPaymentPending: false, enrollment: null });

    let enrollment = await db.select(enrollmentColumns).from(enrollments).where(and(eq(enrollments.userId, authUser.id), eq(enrollments.courseId, courseId))).limit(1).then((r) => r[0] ?? null);

    if (enrollment && !hasPaidAccess(enrollment.paymentStatus) && enrollment.asaasPaymentId) {
      try {
        await syncEnrollmentPayment(enrollment);
        enrollment = await db.select(enrollmentColumns).from(enrollments).where(eq(enrollments.id, enrollment.id)).limit(1).then((r) => r[0] ?? null);
      } catch (error) {
        console.error('Error syncing Asaas payment:', error);
      }
    }

    const isEnrolled = !!enrollment && hasPaidAccess(enrollment.paymentStatus);
    const isPaymentPending = !!enrollment && !isEnrolled && enrollment.paymentStatus === 'PENDING';

    return NextResponse.json({
      success: true,
      isEnrolled,
      isPaymentPending,
      paymentUrl: isPaymentPending ? enrollment?.paymentUrl ?? null : null,
      enrollment: enrollment && {
        id: enrollment.id,
        enrolledAt: enrollment.enrolledAt,
        progressPercent: enrollment.progressPercent,
        paymentStatus: enrollment.paymentStatus,
      },
    });
  } catch (error) {
    console.error('Error checking enrollment:', error);
    return NextResponse.json({ success: false, error: 'Erro ao verificar inscrição' }, { status: 500 });
  }
}
