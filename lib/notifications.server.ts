import { and, eq, isNotNull, isNull } from 'drizzle-orm'
import { renderCoursePurchaseEmail } from '@/lib/account-emails'
import { contactPhoneLabel, contactReasonLabel, type ContactSubmission } from '@/lib/contact'
import { db } from '@/lib/db'
import { courses, enrollments, users } from '@/lib/db/schema'
import { sendEmail } from '@/lib/email'
import { LUTTEROS_ENTITY } from '@/lib/legal-entity'
import {
  renderAccountWelcomeEmail,
  renderAdminContactEmail,
  renderAdminSaleEmail,
  renderCourseEnrollmentEmail,
  renderCourseRefundEmail,
  renderWaitlistConfirmationEmail,
  type RenderedEmail,
} from '@/lib/notification-emails'

// Every sender here swallows its own errors: a mail failure must never fail a payment
// webhook (Asaas would retry it) or a user-facing request.

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || LUTTEROS_ENTITY.siteUrl).replace(/\/+$/, '')
}

function adminAddress(): string {
  return process.env.ADMIN_NOTIFICATION_EMAIL || LUTTEROS_ENTITY.contactEmail
}

async function deliver(
  kind: string,
  to: string,
  message: RenderedEmail,
  extra: { replyTo?: string; context?: Record<string, unknown> } = {},
): Promise<boolean> {
  const result = await sendEmail({
    to,
    subject: message.subject,
    html: message.html,
    text: message.text,
    replyTo: extra.replyTo,
    tags: [{ name: 'type', value: kind }],
  })
  if (!result.success) console.error(`E-mail ${kind} failed`, { ...extra.context, message: result.message })
  return result.success
}

async function safely(kind: string, context: Record<string, unknown>, task: () => Promise<void>): Promise<void> {
  try {
    await task()
  } catch (error) {
    console.error(`E-mail ${kind} failed`, { ...context, error })
  }
}

async function loadEnrollment(enrollmentId: string) {
  return db
    .select({
      email: users.email,
      name: users.name,
      displayName: users.displayName,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      paidAmount: enrollments.paidAmount,
      paidAt: enrollments.paidAt,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.userId, users.id))
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.id, enrollmentId))
    .limit(1)
    .then((rows) => rows[0] ?? null)
}

// Sent once, right after the payment moves an enrollment to COMPLETED:
// the buyer gets the course link and the team gets a sale notice.
export async function sendCoursePurchaseEmails(enrollmentId: string): Promise<void> {
  await safely('course_purchase', { enrollmentId }, async () => {
    const row = await loadEnrollment(enrollmentId)
    if (!row) return

    const baseUrl = siteUrl()
    const amount = Number(row.paidAmount ?? 0)
    const paidAt = row.paidAt ?? new Date()
    const buyerName = row.displayName || row.name

    await Promise.all([
      row.email
        ? deliver('course_purchase', row.email, renderCoursePurchaseEmail({
            name: buyerName,
            courseTitle: row.courseTitle,
            amount,
            paidAt,
            courseUrl: `${baseUrl}/courses/${row.courseSlug}/lessons`,
            myCoursesUrl: `${baseUrl}/courses/my-courses`,
          }), { context: { enrollmentId } })
        : Promise.resolve(),
      deliver('admin_sale', adminAddress(), renderAdminSaleEmail({
        buyerName,
        buyerEmail: row.email ?? 'não informado',
        courseTitle: row.courseTitle,
        amount,
        paidAt,
        enrollmentId,
      }), { context: { enrollmentId } }),
    ])
  })
}

export async function sendCourseRefundEmail(enrollmentId: string): Promise<void> {
  await safely('course_refund', { enrollmentId }, async () => {
    const row = await loadEnrollment(enrollmentId)
    if (!row?.email) return

    await deliver('course_refund', row.email, renderCourseRefundEmail({
      name: row.displayName || row.name,
      courseTitle: row.courseTitle,
      amount: Number(row.paidAmount ?? 0),
      coursesUrl: `${siteUrl()}/courses`,
    }), { context: { enrollmentId } })
  })
}

// Free courses only; staff access and paid purchases have their own messages.
export async function sendCourseEnrollmentEmail(enrollmentId: string): Promise<void> {
  await safely('course_enrollment', { enrollmentId }, async () => {
    const row = await loadEnrollment(enrollmentId)
    if (!row?.email) return

    const baseUrl = siteUrl()
    await deliver('course_enrollment', row.email, renderCourseEnrollmentEmail({
      name: row.displayName || row.name,
      courseTitle: row.courseTitle,
      courseUrl: `${baseUrl}/courses/${row.courseSlug}/lessons`,
      myCoursesUrl: `${baseUrl}/courses/my-courses`,
    }), { context: { enrollmentId } })
  })
}

// Welcome for a new account, sent once it is usable: after the e-mail is confirmed (password
// sign-up) or on the first Google sign-in. The claim below is atomic, so concurrent triggers
// (confirmation link, password reset, Google link) can never send it twice, and accounts that
// existed before the column was added were backfilled as already welcomed.
export async function sendAccountWelcomeEmail(userId: string): Promise<void> {
  await safely('account_welcome', { userId }, async () => {
    const [user] = await db
      .update(users)
      .set({ welcomeEmailSentAt: new Date() })
      .where(and(eq(users.id, userId), isNull(users.welcomeEmailSentAt), isNotNull(users.emailVerified), isNotNull(users.email)))
      .returning({ email: users.email, name: users.name, displayName: users.displayName })
    if (!user?.email) return

    const baseUrl = siteUrl()
    const sent = await deliver('account_welcome', user.email, renderAccountWelcomeEmail({
      name: user.displayName || user.name,
      coursesUrl: `${baseUrl}/courses`,
      articlesUrl: `${baseUrl}/articles`,
      myCoursesUrl: `${baseUrl}/courses/my-courses`,
    }), { context: { userId } }).catch(() => false)

    // Release the claim so a later trigger (e.g. a password reset) can try again.
    if (!sent) await db.update(users).set({ welcomeEmailSentAt: null }).where(eq(users.id, userId))
  })
}

export async function sendWaitlistConfirmationEmail(email: string): Promise<void> {
  await safely('waitlist_confirmation', {}, async () => {
    await deliver(
      'waitlist_confirmation',
      email,
      renderWaitlistConfirmationEmail({ articlesUrl: `${siteUrl()}/articles` }),
    )
  })
}

// Replies go straight to the sender because replyTo is their address.
export async function sendContactNotificationEmail(submission: ContactSubmission): Promise<void> {
  await safely('admin_contact', { submissionId: submission.submissionId }, async () => {
    await deliver('admin_contact', adminAddress(), renderAdminContactEmail({
      name: submission.name,
      email: submission.email,
      phone: contactPhoneLabel(submission.phone),
      reasonLabel: contactReasonLabel(submission.reason),
      subject: submission.subject || null,
      message: submission.message,
      adminUrl: `${siteUrl()}/admin/contact/${submission.submissionId}`,
    }), { replyTo: submission.email, context: { submissionId: submission.submissionId } })
  })
}
