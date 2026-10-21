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
