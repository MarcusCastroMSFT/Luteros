'use client'

import { useEffect, useState } from 'react'
import { IconTrendingUp, IconEdit, IconEye } from "@tabler/icons-react"
import { StatsCard } from "@/components/common/stats-card"
import { StatsContainer } from "@/components/common/stats-container"
import { Skeleton } from "@/components/ui/skeleton"

interface ArticleStats {
  totalArticles: number
  totalArticlesGrowth: string
  newArticlesThisMonth: number
  totalViews: number
  totalViewsGrowth: string
  viewsThisMonth: number
  publishedArticles: number
  activeArticlesGrowth: string
  draftArticles: number
  totalComments: number
  totalCommentsGrowth: string
  commentsThisMonth: number
}

interface ArticlesStatsProps {
  refreshKey?: number
}

export function ArticlesStats({ refreshKey }: ArticlesStatsProps = {}) {
  const [stats, setStats] = useState<ArticleStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/articles/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch article statistics')
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error('Error fetching article stats:', err)
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

  const totalArticlesGrowthNum = parseFloat(stats.totalArticlesGrowth)
  const totalViewsGrowthNum = parseFloat(stats.totalViewsGrowth)
  const activeArticlesGrowthNum = parseFloat(stats.activeArticlesGrowth)
  const totalCommentsGrowthNum = parseFloat(stats.totalCommentsGrowth)

  return (
    <StatsContainer>
      <StatsCard
        title="Total de Artigos"
        value={stats.totalArticles.toString()}
        trend={{
          value: `${totalArticlesGrowthNum >= 0 ? '+' : ''}${stats.totalArticlesGrowth}%`,
          isPositive: totalArticlesGrowthNum >= 0,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Crescimento do conteúdo",
          detail: `${stats.newArticlesThisMonth} novos artigos este mês`,
          icon: IconEdit
        }}
      />
      
      <StatsCard
        title="Visualizações Totais"
        value={stats.totalViews.toLocaleString()}
        trend={{
          value: `${totalViewsGrowthNum >= 0 ? '+' : ''}${stats.totalViewsGrowth}%`,
          isPositive: totalViewsGrowthNum >= 0,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Engajamento crescendo",
          detail: `+${stats.viewsThisMonth.toLocaleString()} visualizações este mês`,
          icon: IconEye
        }}
      />
      
      <StatsCard
        title="Artigos Ativos"
        value={stats.publishedArticles.toString()}
        trend={{
          value: `${activeArticlesGrowthNum >= 0 ? '+' : ''}${stats.activeArticlesGrowth}%`,
          isPositive: activeArticlesGrowthNum >= 0,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Conteúdo publicado",
          detail: `${stats.draftArticles} artigos em rascunho`,
          icon: IconEdit
        }}
      />
      
      <StatsCard
        title="Comentários"
        value={stats.totalComments.toLocaleString()}
        trend={{
          value: `${totalCommentsGrowthNum >= 0 ? '+' : ''}${stats.totalCommentsGrowth}%`,
          isPositive: totalCommentsGrowthNum >= 0,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Engajamento da comunidade",
          detail: `+${stats.commentsThisMonth} comentários este mês`,
          icon: IconTrendingUp
        }}
      />
    </StatsContainer>
  )
}
