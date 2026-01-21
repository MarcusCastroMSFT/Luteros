'use client'

import { useEffect, useState } from 'react'
import { IconTrendingUp, IconBuildingStore, IconPackage, IconUsers } from "@tabler/icons-react"
import { StatsCard } from "@/components/common/stats-card"
import { StatsContainer } from "@/components/common/stats-container"
import { Skeleton } from "@/components/ui/skeleton"

interface PartnerStats {
  totalPartners: number
  totalPartnersGrowth: string
  newPartnersThisMonth: number
  activePartners: number
  activePartnersGrowth: string
  inactivePartners: number
  totalProducts: number
  averageProductsPerPartner: string
}

interface PartnersStatsProps {
  refreshKey?: number
}

export function PartnersStats({ refreshKey }: PartnersStatsProps = {}) {
  const [stats, setStats] = useState<PartnerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/partners/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch partner statistics')
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error('Error fetching partner stats:', err)
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

  const totalPartnersGrowthNum = parseFloat(stats.totalPartnersGrowth)
  const activePartnersGrowthNum = parseFloat(stats.activePartnersGrowth)

  return (
    <StatsContainer>
      <StatsCard
        title="Total de Parceiros"
        value={stats.totalPartners.toString()}
        trend={{
          value: `${totalPartnersGrowthNum >= 0 ? '+' : ''}${stats.totalPartnersGrowth}%`,
          isPositive: totalPartnersGrowthNum >= 0,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Rede de parcerias",
          detail: `${stats.newPartnersThisMonth} novos parceiros este mês`,
          icon: IconBuildingStore
        }}
      />
      
      <StatsCard
        title="Parceiros Ativos"
        value={stats.activePartners.toString()}
        trend={{
          value: `${activePartnersGrowthNum >= 0 ? '+' : ''}${stats.activePartnersGrowth}%`,
          isPositive: activePartnersGrowthNum >= 0,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Parceiros com produtos",
          detail: `${stats.inactivePartners} inativos`,
          icon: IconBuildingStore
        }}
      />
      
      <StatsCard
        title="Total de Produtos"
        value={stats.totalProducts.toString()}
        trend={{
          value: `${stats.averageProductsPerPartner}`,
          isPositive: true,
          icon: IconPackage
        }}
        footer={{
          label: "Produtos cadastrados",
          detail: "Média por parceiro",
          icon: IconPackage
        }}
      />
      
      <StatsCard
        title="Média de Produtos"
        value={stats.averageProductsPerPartner}
        trend={{
          value: "por parceiro",
          isPositive: true,
          icon: IconUsers
        }}
        footer={{
          label: "Diversificação",
          detail: "Produtos por parceiro ativo",
          icon: IconUsers
        }}
      />
    </StatsContainer>
  )
}
