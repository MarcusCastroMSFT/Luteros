"use client"

import { useEffect, useState } from "react"
import { IconTrendingDown, IconTrendingUp, IconUsers, IconMessageCircle, IconHeart, IconShield, IconMinus } from "@tabler/icons-react"
import { StatsCard } from "@/components/common/stats-card"
import { StatsContainer } from "@/components/common/stats-container"

interface CommunityStatsData {
  totalPosts: number
  newPostsThisWeek: number
  postsGrowth: number
  activeMembers: number
  membersGrowth: number
  moderatedPosts: number
  moderatedGrowth: number
  totalInteractions: number
  interactionsGrowth: number
}

function formatTrend(percent: number): { value: string; isPositive: boolean; icon: typeof IconTrendingUp } {
  if (percent === 0) return { value: '0%', isPositive: true, icon: IconMinus }
  if (percent > 0) return { value: `+${percent}%`, isPositive: true, icon: IconTrendingUp }
  return { value: `${percent}%`, isPositive: false, icon: IconTrendingDown }
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString('pt-BR')
}

export function CommunityStats() {
  const [stats, setStats] = useState<CommunityStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/community/stats', { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: CommunityStatsData | null) => {
        if (data) setStats(data)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') console.error('Failed to load community stats:', err)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  // Empty state while loading or when stats fail — show zeros rather than fake numbers
  const data: CommunityStatsData = stats ?? {
    totalPosts: 0,
    newPostsThisWeek: 0,
    postsGrowth: 0,
    activeMembers: 0,
    membersGrowth: 0,
    moderatedPosts: 0,
    moderatedGrowth: 0,
    totalInteractions: 0,
    interactionsGrowth: 0,
  }

  // For moderation, a *decrease* is good. Flip the sign-positive logic for display.
  const moderatedTrend = formatTrend(data.moderatedGrowth)
  const moderatedTrendForDisplay = {
    ...moderatedTrend,
    isPositive: data.moderatedGrowth <= 0,
  }

  return (
    <StatsContainer>
      <StatsCard
        title="Total de Posts"
        value={loading ? '—' : data.totalPosts.toLocaleString('pt-BR')}
        trend={formatTrend(data.postsGrowth)}
        footer={{
          label: 'Crescimento da comunidade',
          detail:
            data.newPostsThisWeek > 0
              ? `${data.newPostsThisWeek} ${data.newPostsThisWeek === 1 ? 'novo post' : 'novos posts'} esta semana`
              : 'Nenhum post novo esta semana',
          icon: IconMessageCircle,
        }}
      />

      <StatsCard
        title="Membros Ativos (7d)"
        value={loading ? '—' : formatCount(data.activeMembers)}
        trend={formatTrend(data.membersGrowth)}
        footer={{
          label: data.activeMembers > 0 ? 'Engajamento ativo' : 'Aguardando atividade',
          detail:
            data.activeMembers > 0
              ? `${data.activeMembers} ${data.activeMembers === 1 ? 'membro postou ou respondeu' : 'membros postaram ou responderam'}`
              : 'Nenhum membro postou nos últimos 7 dias',
          icon: IconUsers,
        }}
      />

      <StatsCard
        title="Posts em Moderação"
        value={loading ? '—' : data.moderatedPosts.toLocaleString('pt-BR')}
        trend={moderatedTrendForDisplay}
        footer={{
          label:
            data.moderatedPosts === 0
              ? 'Comunidade saudável'
              : data.moderatedPosts === 1
              ? '1 post requer atenção'
              : `${data.moderatedPosts} posts requerem atenção`,
          detail: data.moderatedGrowth < 0 ? 'Menos violações que no mês passado' : 'Em moderação ou denunciados',
          icon: IconShield,
        }}
      />

      <StatsCard
        title="Interações Totais"
        value={loading ? '—' : formatCount(data.totalInteractions)}
        trend={formatTrend(data.interactionsGrowth)}
        footer={{
          label: data.totalInteractions > 0 ? 'Comunidade engajada' : 'Sem interações ainda',
          detail: 'Respostas e curtidas',
          icon: IconHeart,
        }}
      />
    </StatsContainer>
  )
}
