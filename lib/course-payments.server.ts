import { and, eq, isNull, ne, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { courses, enrollments, users } from '@/lib/db/schema'
import { getAsaasClient, type AsaasClient, type AsaasPayment } from '@/lib/asaas'
import { getCourseChargeAmount } from '@/lib/course-pricing'
import { isValidCpfCnpj, normalizeCpfCnpj } from '@/lib/cpf-cnpj'
import { mapAsaasStatus, type EnrollmentPaymentStatus } from '@/lib/payment-status'

const PAYMENT_DUE_DAYS = 3

export class CheckoutError extends Error {
  constructor(
    message: string,
    readonly code: 'CPF_REQUIRED' | 'CPF_INVALID' | 'PAYMENT_PROVIDER_ERROR' | 'USER_NOT_FOUND',
    readonly status: number,
  ) {
    super(message)
    this.name = 'CheckoutError'
  }
}

export function formatDueDate(from: Date, days = PAYMENT_DUE_DAYS): string {
  const due = new Date(from.getTime() + days * 24 * 60 * 60 * 1000)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(due)
}

interface EnrollmentRow {
  id: string
  courseId: string
  paymentStatus: string | null
  asaasPaymentId: string | null
  paymentUrl: string | null
  paidAmount: string | null
}

async function adjustEnrollmentCount(courseId: string, delta: 1 | -1) {
  await db
    .update(courses)
    .set({ enrollmentCount: sql`GREATEST(${courses.enrollmentCount} + ${delta}, 0)` })
    .where(eq(courses.id, courseId))
}

// Moves an enrollment to a new payment status. Once paid, only a refund can revoke access,
// so late OVERDUE/PENDING updates can never lock out a paying student.
export async function applyEnrollmentPaymentStatus(
  enrollment: Pick<EnrollmentRow, 'id' | 'courseId'>,
  status: EnrollmentPaymentStatus,
): Promise<boolean> {
  if (status === 'COMPLETED') {
    const updated = await db
      .update(enrollments)
      .set({ paymentStatus: 'COMPLETED', paidAt: new Date() })
      .where(and(
        eq(enrollments.id, enrollment.id),
        or(isNull(enrollments.paymentStatus), ne(enrollments.paymentStatus, 'COMPLETED')),
      ))
      .returning({ id: enrollments.id })

    if (updated.length === 0) return false
    await adjustEnrollmentCount(enrollment.courseId, 1)
    return true
  }

  if (status === 'REFUNDED') {
    const revoked = await db
      .update(enrollments)
      .set({ paymentStatus: 'REFUNDED' })
      .where(and(eq(enrollments.id, enrollment.id), eq(enrollments.paymentStatus, 'COMPLETED')))
      .returning({ id: enrollments.id })

    if (revoked.length > 0) {
      await adjustEnrollmentCount(enrollment.courseId, -1)
      return true
    }
  }

  const updated = await db
    .update(enrollments)
    .set({ paymentStatus: status })
    .where(and(
      eq(enrollments.id, enrollment.id),
      or(isNull(enrollments.paymentStatus), ne(enrollments.paymentStatus, 'COMPLETED')),
      sql`${enrollments.paymentStatus} IS DISTINCT FROM ${status}`,
    ))
    .returning({ id: enrollments.id })

  return updated.length > 0
}

function paymentMatchesEnrollment(payment: AsaasPayment, enrollment: EnrollmentRow): boolean {
  if (payment.externalReference && payment.externalReference !== enrollment.id) return false
  if (enrollment.paidAmount === null) return true
  return Math.abs(Number(payment.value) - Number(enrollment.paidAmount)) < 0.005
}

export function resolveEnrollmentStatus(payment: AsaasPayment): EnrollmentPaymentStatus {
  return payment.deleted ? 'CANCELLED' : mapAsaasStatus(payment.status)
}

// Asks Asaas for the current truth of a payment and reconciles the enrollment with it.
export async function syncEnrollmentPayment(
  enrollment: EnrollmentRow,
  client: AsaasClient = getAsaasClient(),
): Promise<EnrollmentPaymentStatus | null> {
  if (!enrollment.asaasPaymentId) return null

  const payment = await client.getPayment(enrollment.asaasPaymentId)
  if (!paymentMatchesEnrollment(payment, enrollment)) {
    console.error('Asaas payment does not match enrollment', { enrollmentId: enrollment.id, paymentId: payment.id })
    return null
  }

  const status = resolveEnrollmentStatus(payment)
  await applyEnrollmentPaymentStatus(enrollment, status)
  return status
}

async function ensureAsaasCustomer(
  user: { id: string; name: string | null; displayName: string | null; email: string | null; cpfCnpj: string | null; asaasCustomerId: string | null },
  cpfCnpjInput: string | undefined,
  client: AsaasClient,
): Promise<string> {
  const cpfCnpj = cpfCnpjInput ? normalizeCpfCnpj(cpfCnpjInput) : user.cpfCnpj

  if (!cpfCnpj) {
    throw new CheckoutError('Informe seu CPF ou CNPJ para continuar com o pagamento.', 'CPF_REQUIRED', 422)
  }
  if (!isValidCpfCnpj(cpfCnpj)) {
    throw new CheckoutError('CPF ou CNPJ inválido.', 'CPF_INVALID', 422)
  }
  if (!user.email) {
    throw new CheckoutError('Sua conta precisa ter um e-mail para realizar pagamentos.', 'PAYMENT_PROVIDER_ERROR', 400)
  }

  if (user.asaasCustomerId) {
    if (cpfCnpj !== user.cpfCnpj) {
      await db.update(users).set({ cpfCnpj }).where(eq(users.id, user.id))
    }
    return user.asaasCustomerId
  }

  const customer = await client.createCustomer({
    name: user.name || user.displayName || user.email,
    email: user.email,
    cpfCnpj,
    externalReference: user.id,
  })
  await db.update(users).set({ cpfCnpj, asaasCustomerId: customer.id }).where(eq(users.id, user.id))
  return customer.id
}

export interface CheckoutResult {
  enrollmentId: string
  paymentUrl: string
  alreadyPaid: boolean
}

// Creates (or reuses) the pending enrollment and Asaas charge for a paid course.
export async function startCoursePayment(
  params: {
    userId: string
    course: { id: string; title: string; price: string | null; discountPrice: string | null; isFree: boolean }
    existing: EnrollmentRow | null
    cpfCnpj?: string
    now?: Date
  },
  client: AsaasClient = getAsaasClient(),
): Promise<CheckoutResult> {
  const { userId, course, existing, cpfCnpj, now = new Date() } = params
  const amount = getCourseChargeAmount(course)

  if (existing) {
    const status = await syncEnrollmentPayment(existing, client).catch((error) => {
      console.error('Could not sync pending Asaas payment:', error)
      return null
    })
    if (status === 'COMPLETED') {
      return { enrollmentId: existing.id, paymentUrl: '', alreadyPaid: true }
    }
    if ((status === 'PENDING' || status === null) && existing.paymentUrl) {
      return { enrollmentId: existing.id, paymentUrl: existing.paymentUrl, alreadyPaid: false }
    }
  }

  const user = await db
    .select({ id: users.id, name: users.name, displayName: users.displayName, email: users.email, cpfCnpj: users.cpfCnpj, asaasCustomerId: users.asaasCustomerId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .then((rows) => rows[0] ?? null)
  if (!user) throw new CheckoutError('Usuário não encontrado.', 'USER_NOT_FOUND', 404)

  const customerId = await ensureAsaasCustomer(user, cpfCnpj, client)

  let enrollmentId = existing?.id ?? null
  let createdEnrollment = false
  if (!enrollmentId) {
    const [row] = await db
      .insert(enrollments)
      .values({ userId, courseId: course.id, paidAmount: amount.toFixed(2), paymentStatus: 'PENDING' })
      .returning({ id: enrollments.id })
    enrollmentId = row.id
    createdEnrollment = true
  }

  try {
    const payment = await client.createPayment({
      customer: customerId,
      value: amount,
      dueDate: formatDueDate(now),
      description: `Curso: ${course.title}`.slice(0, 500),
      externalReference: enrollmentId,
    })

    if (!payment.invoiceUrl) {
      throw new Error('Asaas did not return an invoice URL')
    }

    await db
      .update(enrollments)
      .set({
        asaasPaymentId: payment.id,
        paymentUrl: payment.invoiceUrl,
        paidAmount: amount.toFixed(2),
        paymentStatus: 'PENDING',
      })
      .where(eq(enrollments.id, enrollmentId))

    return { enrollmentId, paymentUrl: payment.invoiceUrl, alreadyPaid: false }
  } catch (error) {
    if (createdEnrollment) {
      await db.delete(enrollments).where(eq(enrollments.id, enrollmentId))
    }
    console.error('Error creating Asaas payment:', error)
    throw new CheckoutError('Não foi possível iniciar o pagamento. Tente novamente.', 'PAYMENT_PROVIDER_ERROR', 502)
  }
}
