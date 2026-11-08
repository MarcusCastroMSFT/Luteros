export interface MonthlySalesRow {
  month: string
  sales: number
  revenue: number
}

export interface MonthlySales extends MonthlySalesRow {
  label: string
}

export const SALES_MONTHS = 12

function monthKey(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`
}

// Current month in Brazil, so a sale at 22:00 on the last day still counts for that month.
export function currentMonthKey(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit' })
    .formatToParts(now)
  const year = parts.find((part) => part.type === 'year')!.value
  const month = parts.find((part) => part.type === 'month')!.value
  return `${year}-${month}`
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number)
  const name = new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, month - 1, 1)))
    .replace('.', '')
  return `${name}/${String(year).slice(2)}`
}

function shiftMonth(key: string, delta: number): string {
  const [year, month] = key.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1 + delta, 1))
  return monthKey(date.getUTCFullYear(), date.getUTCMonth())
}

export function firstMonthKey(now: Date = new Date(), months: number = SALES_MONTHS): string {
  return shiftMonth(currentMonthKey(now), -(months - 1))
}

// Returns the last `months` months ending at the current one, with zeros where nothing was sold.
export function buildMonthlySeries(
  rows: MonthlySalesRow[],
  now: Date = new Date(),
  months: number = SALES_MONTHS,
): MonthlySales[] {
  const current = currentMonthKey(now)
  const byMonth = new Map(rows.map((row) => [row.month, row]))

  return Array.from({ length: months }, (_, index) => {
    const key = shiftMonth(current, index - (months - 1))
    const row = byMonth.get(key)
    return { month: key, label: monthLabel(key), sales: row?.sales ?? 0, revenue: row?.revenue ?? 0 }
  })
}

export interface RecentSale {
  id: string
  buyerName: string
  buyerEmail: string
  courseTitle: string
  courseSlug: string
  amount: number
  paidAt: string
}

export interface CourseSalesSummary {
  monthly: MonthlySales[]
  recent: RecentSale[]
  totals: {
    allTimeSales: number
    allTimeRevenue: number
    thisMonthSales: number
    thisMonthRevenue: number
    previousMonthSales: number
  }
}

export function summarizeSales(
  rows: MonthlySalesRow[],
  recent: RecentSale[],
  allTime: { sales: number; revenue: number },
  now: Date = new Date(),
): CourseSalesSummary {
  const monthly = buildMonthlySeries(rows, now)
  const thisMonth = monthly[monthly.length - 1]
  const previousMonth = monthly[monthly.length - 2]
  return {
    monthly,
    recent,
    totals: {
      allTimeSales: allTime.sales,
      allTimeRevenue: allTime.revenue,
      thisMonthSales: thisMonth.sales,
      thisMonthRevenue: thisMonth.revenue,
      previousMonthSales: previousMonth?.sales ?? 0,
    },
  }
}
