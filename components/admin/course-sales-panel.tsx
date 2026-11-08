'use client'

import Link from 'next/link'
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis, type TooltipProps } from 'recharts'
import { ArrowDownRight, ArrowUpRight, ShoppingBag } from 'lucide-react'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import type { CourseSalesSummary, MonthlySales } from '@/lib/course-sales'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' })

const chartConfig = { sales: { label: 'Vendas', color: '#198189' } } satisfies ChartConfig

function SalesTooltip({ active, payload }: TooltipProps<number, string>) {
  const month = payload?.[0]?.payload as MonthlySales | undefined
  if (!active || !month) return null
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-md">
      <p className="font-medium capitalize">{month.label}</p>
      <p className="mt-1 text-muted-foreground">
        {month.sales} {month.sales === 1 ? 'venda' : 'vendas'} · {brl.format(month.revenue)}
      </p>
    </div>
  )
}

function Stat({ label, value, detail }: { label: string; value: string; detail?: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-background/60 px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {detail ? <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p> : null}
    </div>
  )
}

function MonthDelta({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return <>Sem vendas no mês anterior</>
  const delta = ((current - previous) / previous) * 100
  const Icon = delta >= 0 ? ArrowUpRight : ArrowDownRight
  return (
    <span className="inline-flex items-center gap-1">
      <Icon className={`h-3.5 w-3.5 ${delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} aria-hidden />
      {Math.abs(delta).toFixed(0)}% vs. mês anterior ({previous})
    </span>
  )
}

export function CourseSalesPanel({ data }: { data: CourseSalesSummary }) {
  const { monthly, recent, totals } = data
  const hasSales = totals.allTimeSales > 0

  return (
    <section aria-label="Vendas de cursos" className="rounded-xl border bg-card shadow-sm">
      <header className="flex flex-col gap-1 border-b p-5">
        <h2 className="text-base font-semibold">Vendas de cursos</h2>
        <p className="text-xs text-muted-foreground">
          Matrículas pagas e confirmadas pelo Asaas. Acessos gratuitos, de administradores e reembolsos não entram.
        </p>
      </header>

      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <Stat
          label="Vendas neste mês"
          value={`${totals.thisMonthSales}`}
          detail={<MonthDelta current={totals.thisMonthSales} previous={totals.previousMonthSales} />}
        />
        <Stat
          label="Receita neste mês"
          value={brl.format(monthly[monthly.length - 1]?.revenue ?? 0)}
          detail={`${totals.allTimeSales} ${totals.allTimeSales === 1 ? 'venda' : 'vendas'} no total · ${brl.format(totals.allTimeRevenue)}`}
        />
      </div>

      <div className="grid gap-6 px-5 pb-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h3 className="mb-2 text-sm font-medium">Cursos vendidos por mês</h3>
          <ChartContainer config={chartConfig} className="h-56 w-full">
            <BarChart data={monthly} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval="preserveStartEnd" fontSize={11} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} fontSize={11} />
              <Tooltip content={SalesTooltip} cursor={{ fill: 'rgba(25,129,137,0.08)' }} />
              <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false} />
            </BarChart>
          </ChartContainer>
          {!hasSales ? (
            <p className="mt-2 text-xs text-muted-foreground">As barras aparecem a partir da primeira venda confirmada.</p>
          ) : null}
        </div>

        <div className="lg:col-span-2">
          <h3 className="mb-2 text-sm font-medium">Últimas 5 vendas</h3>
          {recent.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <ShoppingBag className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" aria-hidden />
              <p className="text-sm text-muted-foreground">Nenhuma venda ainda</p>
            </div>
          ) : (
            <ol className="divide-y rounded-lg border">
              {recent.map((sale) => (
                <li key={sale.id} className="flex items-start justify-between gap-3 px-3 py-2.5">
                  <div className="min-w-0">
                    <Link
                      href={`/courses/${sale.courseSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-sm font-medium hover:text-primary"
                    >
                      {sale.courseTitle}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground" title={sale.buyerEmail}>{sale.buyerName}</p>
                    <p className="text-xs text-muted-foreground">{dateTime.format(new Date(sale.paidAt))}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">{brl.format(sale.amount)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  )
}
