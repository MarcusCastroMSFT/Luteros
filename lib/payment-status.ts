// Asaas payment statuses that mean the money was captured (or is guaranteed).
const PAID_ASAAS_STATUSES = new Set(['CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH'])

// Asaas statuses where the charge was reversed and access must be revoked.
const REVOKED_ASAAS_STATUSES = new Set([
  'REFUNDED',
  'REFUND_REQUESTED',
  'REFUND_IN_PROGRESS',
  'CHARGEBACK_REQUESTED',
  'CHARGEBACK_DISPUTE',
  'AWAITING_CHARGEBACK_REVERSAL',
])

export type EnrollmentPaymentStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'REFUNDED' | 'CANCELLED'

export function mapAsaasStatus(status: string | null | undefined): EnrollmentPaymentStatus {
  if (!status) return 'PENDING'
  if (PAID_ASAAS_STATUSES.has(status)) return 'COMPLETED'
  if (REVOKED_ASAAS_STATUSES.has(status)) return 'REFUNDED'
  if (status === 'OVERDUE') return 'OVERDUE'
  if (status === 'DELETED') return 'CANCELLED'
  return 'PENDING'
}

// Free enrollments are stored as COMPLETED; legacy rows without a status keep access.
export function hasPaidAccess(paymentStatus: string | null | undefined): boolean {
  return paymentStatus == null || paymentStatus === 'COMPLETED'
}
