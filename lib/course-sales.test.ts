import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildMonthlySeries, currentMonthKey, firstMonthKey, summarizeSales } from './course-sales'

test('month keys use Brazil time, not UTC', () => {
  // 01:30 UTC on 1 Dec is still 22:30 of 30 Nov in São Paulo.
  assert.equal(currentMonthKey(new Date('2026-12-01T01:30:00Z')), '2026-11')
  assert.equal(currentMonthKey(new Date('2026-12-01T04:00:00Z')), '2026-12')
})

test('series covers 12 months ending now and fills gaps with zeros', () => {
  const series = buildMonthlySeries(
    [{ month: '2026-11', sales: 3, revenue: 441 }, { month: '2026-01', sales: 1, revenue: 147.5 }],
    new Date('2026-11-08T12:00:00Z'),
  )
  assert.equal(series.length, 12)
  assert.equal(series[0].month, '2025-12')
  assert.equal(series[11].month, '2026-11')
  assert.equal(series[11].sales, 3)
  assert.equal(series.find((m) => m.month === '2026-01')?.revenue, 147.5)
  assert.equal(series.find((m) => m.month === '2026-05')?.sales, 0)
})

test('series crosses the year boundary correctly', () => {
  const series = buildMonthlySeries([], new Date('2026-02-10T12:00:00Z'), 4)
  assert.deepEqual(series.map((m) => m.month), ['2025-11', '2025-12', '2026-01', '2026-02'])
  assert.equal(firstMonthKey(new Date('2026-02-10T12:00:00Z'), 4), '2025-11')
})

test('summary exposes this and the previous month', () => {
  const summary = summarizeSales(
    [{ month: '2026-11', sales: 2, revenue: 10 }, { month: '2026-10', sales: 5, revenue: 25 }],
    [],
    { sales: 9, revenue: 80 },
    new Date('2026-11-08T12:00:00Z'),
  )
  assert.equal(summary.totals.thisMonthSales, 2)
  assert.equal(summary.totals.previousMonthSales, 5)
  assert.equal(summary.totals.allTimeRevenue, 80)
})
