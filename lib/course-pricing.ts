export interface CoursePricing {
  price: string | number | null
  discountPrice: string | number | null
  isFree: boolean
}

// Mirrors the public price shown on the course page: the discount price wins when set.
export function getCourseChargeAmount(course: CoursePricing): number {
  if (course.isFree) return 0

  const discount = course.discountPrice !== null && course.discountPrice !== ''
    ? Number(course.discountPrice)
    : null
  const amount = discount !== null && Number.isFinite(discount) ? discount : Number(course.price ?? 0)

  if (!Number.isFinite(amount) || amount <= 0) return 0
  return Math.round(amount * 100) / 100
}

// Asaas rejects any charge below R$ 5,00 ("invalid_value"), so a paid course cannot sell for less.
export const MIN_CHARGE_AMOUNT = 5

export const MIN_CHARGE_MESSAGE =
  'O valor cobrado de um curso pago precisa ser de pelo menos R$ 5,00 (mínimo do Asaas). Ajuste o preço ou o preço promocional.'

export function isBelowMinimumCharge(course: CoursePricing): boolean {
  const amount = getCourseChargeAmount(course)
  return amount > 0 && amount < MIN_CHARGE_AMOUNT
}
