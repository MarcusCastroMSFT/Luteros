'use client'

import { useEffect, useState } from 'react'
import { IconTrendingUp, IconPackage, IconStar, IconUsers } from "@tabler/icons-react"
import { StatsCard } from "@/components/common/stats-card"
import { StatsContainer } from "@/components/common/stats-container"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductStats {
  totalProducts: number
  totalProductsGrowth: string
  newProductsThisMonth: number
  activeProducts: number
  activeProductsGrowth: string
  inactiveProducts: number
  featuredProducts: number
  totalUsageCount: number
  membersOnlyProducts: number
  allAccessProducts: number
  categoriesCount: number
}

interface ProductsStatsProps {
  refreshKey?: number
}

export function ProductsStats({ refreshKey }: ProductsStatsProps = {}) {
  const [stats, setStats] = useState<ProductStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/products/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch product statistics')
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error('Error fetching product stats:', err)
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

  const totalProductsGrowthNum = parseFloat(stats.totalProductsGrowth)
  const activeProductsGrowthNum = parseFloat(stats.activeProductsGrowth)

  return (
    <StatsContainer>
      <StatsCard
        title="Total de Produtos"
        value={stats.totalProducts.toString()}
        trend={{
          value: `${totalProductsGrowthNum >= 0 ? '+' : ''}${stats.totalProductsGrowth}%`,
          isPositive: totalProductsGrowthNum >= 0,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Crescimento de parcerias",
          detail: `${stats.newProductsThisMonth} novos produtos este mês`,
          icon: IconPackage
        }}
      />
      
      <StatsCard
        title="Produtos Ativos"
        value={stats.activeProducts.toString()}
        trend={{
          value: `${activeProductsGrowthNum >= 0 ? '+' : ''}${stats.activeProductsGrowth}%`,
          isPositive: activeProductsGrowthNum >= 0,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Ofertas disponíveis",
          detail: `${stats.inactiveProducts} produtos inativos`,
          icon: IconPackage
        }}
      />
      
      <StatsCard
        title="Em Destaque"
        value={stats.featuredProducts.toString()}
        trend={{
          value: `${stats.categoriesCount} categorias`,
          isPositive: true,
          icon: IconStar
        }}
        footer={{
          label: "Promoções destacadas",
          detail: `${stats.totalUsageCount.toLocaleString()} usos totais`,
          icon: IconStar
        }}
      />
      
      <StatsCard
        title="Acesso por Tipo"
        value={stats.allAccessProducts.toString()}
        trend={{
          value: `${stats.membersOnlyProducts} exclusivos`,
          isPositive: true,
          icon: IconUsers
        }}
        footer={{
          label: "Para todos os usuários",
          detail: `${stats.membersOnlyProducts} apenas para membros`,
          icon: IconUsers
        }}
      />
    </StatsContainer>
  )
}
