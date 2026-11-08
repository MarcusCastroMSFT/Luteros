import 'server-only'
import { and, desc, eq, isNotNull, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { courses, enrollments, users } from '@/lib/db/schema'
import {
  firstMonthKey,
  summarizeSales,
  type CourseSalesSummary,
  type RecentSale,
} from '@/lib/course-sales'

// A sale is a paid enrollment: confirmed by Asaas (it has a payment id) and not refunded.
// Staff access and free courses have no Asaas payment, so they never count.
const isSale = and(
  eq(enrollments.paymentStatus, 'COMPLETED'),
  isNotNull(enrollments.asaasPaymentId),
)

const soldAt = sql`coalesce(${enrollments.paidAt}, ${enrollments.enrolledAt})`
// Timestamps are stored in UTC without a zone; months are counted in Brazil time.
const brazilMonth = sql<string>`to_char((${soldAt} at time zone 'UTC') at time zone 'America/Sao_Paulo', 'YYYY-MM')`

export async function getCourseSales(now: Date = new Date()): Promise<CourseSalesSummary> {
  const firstMonth = firstMonthKey(now)

  const [monthlyRows, recentRows, totalRow] = await Promise.all([
    db
      .select({
        month: brazilMonth,
        sales: sql<number>`count(*)::int`,
        revenue: sql<string>`coalesce(sum(${enrollments.paidAmount}), 0)`,
      })
      .from(enrollments)
      .where(and(isSale, sql`${brazilMonth} >= ${firstMonth}`))
      .groupBy(brazilMonth),
    db
      .select({
        id: enrollments.id,
        buyerName: users.name,
        buyerDisplayName: users.displayName,
        buyerEmail: users.email,
        courseTitle: courses.title,
        courseSlug: courses.slug,
        amount: enrollments.paidAmount,
        paidAt: enrollments.paidAt,
        enrolledAt: enrollments.enrolledAt,
      })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.userId, users.id))
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(isSale)
      .orderBy(desc(soldAt))
      .limit(5),
    db
      .select({
        sales: sql<number>`count(*)::int`,
        revenue: sql<string>`coalesce(sum(${enrollments.paidAmount}), 0)`,
      })
      .from(enrollments)
      .where(isSale),
  ])

  const recent: RecentSale[] = recentRows.map((row) => ({
    id: row.id,
    buyerName: row.buyerDisplayName || row.buyerName || row.buyerEmail || 'Aluno',
    buyerEmail: row.buyerEmail ?? '',
    courseTitle: row.courseTitle,
    courseSlug: row.courseSlug,
    amount: Number(row.amount ?? 0),
    paidAt: (row.paidAt ?? row.enrolledAt).toISOString(),
  }))

  return summarizeSales(
    monthlyRows.map((row) => ({ month: row.month, sales: Number(row.sales), revenue: Number(row.revenue) })),
    recent,
    { sales: Number(totalRow[0]?.sales ?? 0), revenue: Number(totalRow[0]?.revenue ?? 0) },
    now,
  )
}
