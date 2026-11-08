import { NextRequest, NextResponse, connection } from 'next/server';
import { revalidateTag } from '@/lib/cache';
import { and, eq, sql } from 'drizzle-orm';
import { getAuthUser, requireAuth } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { courses, enrollments, users } from '@/lib/db/schema';
import { getStaffAccess, type StaffAccess } from '@/lib/course-access';
import { getCourseInstructorIds } from '@/lib/course-instructors.server';
import { getCourseChargeAmount } from '@/lib/course-pricing';
import { CheckoutError, startCoursePayment, syncEnrollmentPayment } from '@/lib/course-payments.server';
import { sendCourseEnrollmentEmail } from '@/lib/notifications.server';
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

// Admins and the course's own instructors get in without paying. The enrollment is a plain
// COMPLETED one with paidAmount 0 and is not counted in the course's student total.
async function grantStaffEnrollment(userId: string, courseId: string, existing: { id: string } | null) {
  if (existing) {
    // Drop any unpaid charge so a late Asaas event cannot downgrade the staff access.
    const [row] = await db
      .update(enrollments)
      .set({ paymentStatus: 'COMPLETED', paidAmount: '0', asaasPaymentId: null, paymentUrl: null })
      .where(eq(enrollments.id, existing.id))
      .returning();
    return row;
  }
  const [row] = await db
    .insert(enrollments)
    .values({ userId, courseId, paidAmount: '0', paymentStatus: 'COMPLETED' })
    .returning();
  return row;
}

async function resolveStaffAccess(
  user: Parameters<typeof getStaffAccess>[0],
  courseId: string,
  courseInstructorId?: string,
): Promise<StaffAccess> {
  if (user.role === 'ADMIN') return 'ADMIN';
  if (user.role !== 'INSTRUCTOR') return null;
  const instructorId = courseInstructorId
    ?? await db.select({ id: courses.instructorId }).from(courses).where(eq(courses.id, courseId)).limit(1).then((r) => r[0]?.id);
  return getStaffAccess(user, await getCourseInstructorIds(courseId, instructorId));
}

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

    const staffAccess = await resolveStaffAccess(authUser, course.id, course.instructorId);
    if (staffAccess) {
      const enrollment = await grantStaffEnrollment(authUser.id, courseId, existing);
      return NextResponse.json({
        success: true,
        requiresPayment: false,
        staffAccess,
        message: staffAccess === 'ADMIN' ? 'Acesso de administrador liberado.' : 'Acesso de instrutor liberado.',
        enrollment: { id: enrollment.id, enrolledAt: enrollment.enrolledAt, courseId: enrollment.courseId, courseTitle: course.title, courseSlug: course.slug },
      });
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

    await sendCourseEnrollmentEmail(enrollment.id);
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
    if (!authUser) return NextResponse.json({ success: true, isEnrolled: false, isPaymentPending: false, staffAccess: null, enrollment: null });

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
    const hasCpfCnpj = await db.select({ cpfCnpj: users.cpfCnpj }).from(users).where(eq(users.id, authUser.id)).limit(1).then((r) => !!r[0]?.cpfCnpj);
    const staffAccess = await resolveStaffAccess(authUser, courseId);

    return NextResponse.json({
      success: true,
      isEnrolled,
      isPaymentPending,
      staffAccess,
      hasCpfCnpj,
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
