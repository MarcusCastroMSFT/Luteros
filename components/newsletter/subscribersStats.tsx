'use client'

import { IconMail, IconMailPlus, IconMailCheck, IconMailX, IconTrendingUp } from "@tabler/icons-react"
import { StatsCard } from "@/components/common/stats-card"
import { StatsContainer } from "@/components/common/stats-container"
import { useEffect, useState } from "react"

interface SubscriberStatsData {
  totalSubscribers: number
  activeSubscribers: number
  newThisMonth: number
  newThisWeek: number
  pendingConfirmations: number
  unsubscribedThisMonth: number
  monthlyGrowth: string
  monthlyGrowthPositive: boolean
  activeRate: string
  churnRate: string
}

export function SubscribersStats() {
  const [stats, setStats] = useState<SubscriberStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/newsletter/subscribers/stats')
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          console.error('API Error:', response.status, errorData)
          throw new Error(`Failed to fetch stats: ${response.status}`)
        }
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching subscriber stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <StatsContainer>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-muted h-32 rounded-lg" />
        ))}
      </StatsContainer>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <StatsContainer>
      <StatsCard
        title="Total de Inscritos"
        value={stats.totalSubscribers.toLocaleString('pt-BR')}
        trend={{
          value: stats.monthlyGrowth,
          isPositive: stats.monthlyGrowthPositive,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Crescimento mensal",
          detail: "comparado ao mês anterior",
          icon: IconMail
        }}
      />
      
      <StatsCard
        title="Inscritos Ativos"
        value={stats.activeSubscribers.toLocaleString('pt-BR')}
        description={`${stats.activeRate} do total`}
        footer={{
          label: "Taxa de ativação",
          detail: "recebendo emails",
          icon: IconMailCheck
        }}
      />
      
      <StatsCard
        title="Novos Este Mês"
        value={stats.newThisMonth.toLocaleString('pt-BR')}
        description={`${stats.newThisWeek.toLocaleString('pt-BR')} esta semana`}
        footer={{
          label: "Novos inscritos",
          detail: "desde o início do mês",
          icon: IconMailPlus
        }}
      />
      
      <StatsCard
        title="Cancelamentos"
        value={stats.unsubscribedThisMonth.toLocaleString('pt-BR')}
        description={`Taxa de churn: ${stats.churnRate}`}
        footer={{
          label: "Cancelamentos",
          detail: "este mês",
          icon: IconMailX
        }}
      />
    </StatsContainer>
  )
}
