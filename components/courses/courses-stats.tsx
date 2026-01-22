'use client'

import { useState, useEffect } from 'react'
import { IconTrendingUp, IconBook, IconUsers, IconStar, IconCertificate } from "@tabler/icons-react"
import { StatsCard } from "@/components/common/stats-card"
import { StatsContainer } from "@/components/common/stats-container"
import { Skeleton } from "@/components/ui/skeleton"

interface CoursesStatsProps {
  refreshKey?: number
}

interface StatsData {
  totalCourses: number
  publishedCourses: number
  draftCourses: number
  totalEnrollments: number
  averageRating: number
}

export function CoursesStats({ refreshKey }: CoursesStatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch('/api/courses/stats')
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }
        
        const data = await response.json()
        
        if (data.success && data.data) {
          setStats(data.data)
        } else {
          throw new Error(data.error || 'Failed to fetch stats')
        }
      } catch (err) {
        console.error('Error fetching courses stats:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [refreshKey])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  if (loading) {
    return (
      <StatsContainer>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-4" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </StatsContainer>
    )
  }

  if (error || !stats) {
    return (
      <StatsContainer>
        <div className="col-span-full text-center text-muted-foreground py-4">
          {error || 'Erro ao carregar estatísticas'}
        </div>
      </StatsContainer>
    )
  }

  return (
    <StatsContainer>
      <StatsCard
        title="Total de Cursos"
        value={stats.totalCourses.toString()}
        trend={{
          value: `${stats.publishedCourses} publicados`,
          isPositive: true,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Cursos no sistema",
          detail: `${stats.draftCourses} em rascunho`,
          icon: IconBook
        }}
      />
      
      <StatsCard
        title="Total de Alunos"
        value={formatNumber(stats.totalEnrollments)}
        trend={{
          value: "inscrições",
          isPositive: true,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Base de alunos ativa",
          detail: "Total de inscrições em cursos",
          icon: IconUsers
        }}
      />
      
      <StatsCard
        title="Avaliação Média"
        value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'}
        trend={{
          value: stats.averageRating > 4.5 ? "Excelente" : stats.averageRating > 4 ? "Muito bom" : "Bom",
          isPositive: stats.averageRating >= 4,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Satisfação dos alunos",
          detail: "Média de todas avaliações",
          icon: IconStar
        }}
      />
      
      <StatsCard
        title="Cursos Publicados"
        value={stats.publishedCourses.toString()}
        trend={{
          value: `${Math.round((stats.publishedCourses / (stats.totalCourses || 1)) * 100)}% do total`,
          isPositive: true,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Cursos ativos",
          detail: "Disponíveis para matrícula",
          icon: IconCertificate
        }}
      />
    </StatsContainer>
  )
}
