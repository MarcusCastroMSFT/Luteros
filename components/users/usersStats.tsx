'use client'

import { IconUsers, IconUserPlus, IconUserCheck, IconCrown, IconTrendingUp } from "@tabler/icons-react";
import { StatsCard } from "@/components/common/stats-card";
import { StatsContainer } from "@/components/common/stats-container";
import { useEffect, useState } from "react";

interface UserStatsData {
  totalUsers: number
  totalUsersGrowth: string
  totalUsersGrowthPositive: boolean
  newUsers: number
  newUsersGrowth: string
  newUsersGrowthPositive: boolean
  activeUsers: number
  activeUsersPercentage: string
  premiumUsers: number
  premiumUsersPercentage: string
}

export function UsersStats() {
  const [stats, setStats] = useState<UserStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/users/stats')
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          console.error('API Error:', response.status, errorData)
          throw new Error(`Failed to fetch stats: ${response.status}`)
        }
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching user stats:', error)
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
        title="Total de Usuários"
        value={stats.totalUsers.toLocaleString('pt-BR')}
        trend={{
          value: stats.totalUsersGrowth,
          isPositive: stats.totalUsersGrowthPositive,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Crescimento de usuários",
          detail: "desde o mês passado",
          icon: IconUsers
        }}
      />
      
      <StatsCard
        title="Novos Usuários"
        value={stats.newUsers.toLocaleString('pt-BR')}
        trend={{
          value: stats.newUsersGrowth,
          isPositive: stats.newUsersGrowthPositive,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Novos registros",
          detail: "desde a semana passada",
          icon: IconUserPlus
        }}
      />
      
      <StatsCard
        title="Usuários Ativos"
        value={stats.activeUsers.toLocaleString('pt-BR')}
        description={`${stats.activeUsersPercentage} do total`}
        footer={{
          label: "Taxa de atividade",
          detail: "Últimos 30 dias",
          icon: IconUserCheck
        }}
      />
      
      <StatsCard
        title="Usuários Premium"
        value={stats.premiumUsers.toLocaleString('pt-BR')}
        description={`${stats.premiumUsersPercentage} do total`}
        footer={{
          label: "Assinantes premium",
          detail: "Receita recorrente",
          icon: IconCrown
        }}
      />
    </StatsContainer>
  );
}
