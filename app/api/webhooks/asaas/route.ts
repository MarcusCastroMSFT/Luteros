import { createHash, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse, connection } from 'next/server';
import { eq } from 'drizzle-orm';
import { revalidateTag } from '@/lib/cache';
import { db } from '@/lib/db';
import { asaasWebhookEvents, courses, enrollments } from '@/lib/db/schema';
import { syncEnrollmentPayment } from '@/lib/course-payments.server';

function tokensMatch(received: string | null, expected: string): boolean {
  if (!received) return false;
  const a = createHash('sha256').update(received).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

interface AsaasWebhookBody {
  id?: string;
  event?: string;
  payment?: { id?: string };
}

export async function POST(request: NextRequest) {
  await connection();

  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!expectedToken) {
    console.error('ASAAS_WEBHOOK_TOKEN is not configured; rejecting Asaas webhook');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  if (!tokensMatch(request.headers.get('asaas-access-token'), expectedToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as AsaasWebhookBody | null;
  const eventId = body?.id;
  const event = body?.event;
  const paymentId = body?.payment?.id;

  // Events we do not act on are acknowledged so Asaas does not pause the queue.
  if (!body || !eventId || !event || !event.startsWith('PAYMENT_') || !paymentId) {
    return NextResponse.json({ received: true });
  }

  try {
    const alreadyProcessed = await db
      .select({ id: asaasWebhookEvents.id })
      .from(asaasWebhookEvents)
      .where(eq(asaasWebhookEvents.id, eventId))
      .limit(1)
      .then((rows) => rows.length > 0);
    if (alreadyProcessed) return NextResponse.json({ received: true });

    const enrollment = await db
      .select({
        id: enrollments.id,
        courseId: enrollments.courseId,
        paymentStatus: enrollments.paymentStatus,
        asaasPaymentId: enrollments.asaasPaymentId,
        paymentUrl: enrollments.paymentUrl,
        paidAmount: enrollments.paidAmount,
        courseSlug: courses.slug,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.asaasPaymentId, paymentId))
      .limit(1)
      .then((rows) => rows[0] ?? null);

    if (enrollment) {
      await syncEnrollmentPayment(enrollment);
      revalidateTag('courses');
      revalidateTag(`course-${enrollment.courseSlug}`);
    }

    await db
      .insert(asaasWebhookEvents)
      .values({ id: eventId, event, paymentId })
      .onConflictDoNothing();

    return NextResponse.json({ received: true });
  } catch (error) {
    // A non-2xx response makes Asaas retry the delivery.
    console.error('Error processing Asaas webhook:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
