'use client'

import { useEffect, useState } from 'react'
import { IconTrendingDown, IconTrendingUp, IconCalendar, IconUsers, IconCurrencyReal } from "@tabler/icons-react"
import { StatsCard } from "@/components/common/stats-card"
import { StatsContainer } from "@/components/common/stats-container"
import { Skeleton } from "@/components/ui/skeleton"

interface EventStats {
  totalEvents: number
  totalEventsGrowth: string
  newEventsThisMonth: number
  totalRegistrations: number
  totalRegistrationsGrowth: string
  registrationsThisMonth: number
  totalRevenue: number
  totalRevenueGrowth: string
  revenueThisMonth: number
  averageAttendance: string
  attendanceGrowth: string
}

interface EventsStatsProps {
  refreshKey?: number
}

export function EventsStats({ refreshKey }: EventsStatsProps = {}) {
  const [stats, setStats] = useState<EventStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/events/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch event statistics')
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error('Error fetching event stats:', err)
        setError(err instanceof Error ? err.message : 'Failed to load stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [refreshKey])

  if (loading) {
    return (
      <StatsContainer>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border bg-card p-6 flex flex-col gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="space-y-1.5 pt-2 border-t">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </StatsContainer>
    )
  }

  if (error || !stats) {
    return null
  }

  const totalEventsGrowthNum = parseFloat(stats.totalEventsGrowth)
  const totalRegistrationsGrowthNum = parseFloat(stats.totalRegistrationsGrowth)
  const totalRevenueGrowthNum = parseFloat(stats.totalRevenueGrowth)
  const attendanceGrowthNum = parseFloat(stats.attendanceGrowth)

  return (
    <StatsContainer>
      <StatsCard
        title="Total de Eventos"
        value={stats.totalEvents.toString()}
        trend={{
          value: `${totalEventsGrowthNum >= 0 ? '+' : ''}${stats.totalEventsGrowth}%`,
          isPositive: totalEventsGrowthNum >= 0,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Crescimento de eventos",
          detail: `${stats.newEventsThisMonth} novos eventos este mês`,
          icon: IconCalendar
        }}
      />
      
      <StatsCard
        title="Total de Inscrições"
        value={stats.totalRegistrations.toLocaleString()}
        trend={{
          value: `${totalRegistrationsGrowthNum >= 0 ? '+' : ''}${stats.totalRegistrationsGrowth}%`,
          isPositive: totalRegistrationsGrowthNum >= 0,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Crescimento de inscrições",
          detail: `+${stats.registrationsThisMonth} inscrições este mês`,
          icon: IconUsers
        }}
      />
      
      <StatsCard
        title="Receita Gerada"
        value={`R$${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        trend={{
          value: `${totalRevenueGrowthNum >= 0 ? '+' : ''}${stats.totalRevenueGrowth}%`,
          isPositive: totalRevenueGrowthNum >= 0,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Performance de receita",
          detail: `R$${stats.revenueThisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} este mês`,
          icon: IconCurrencyReal
        }}
      />
      
      <StatsCard
        title="Taxa de Presença"
        value={`${stats.averageAttendance}%`}
        trend={{
          value: `${attendanceGrowthNum >= 0 ? '+' : ''}${stats.attendanceGrowth}%`,
          isPositive: attendanceGrowthNum >= 0,
          icon: attendanceGrowthNum >= 0 ? IconTrendingUp : IconTrendingDown
        }}
        footer={{
          label: attendanceGrowthNum >= 0 ? "Presença crescendo" : "Presença em queda",
          detail: attendanceGrowthNum >= 0 ? "Acima da média" : "Requer atenção",
          icon: attendanceGrowthNum >= 0 ? IconTrendingUp : IconTrendingDown
        }}
      />
    </StatsContainer>
  )
}
