import { IconTrendingDown, IconTrendingUp, IconUsers, IconMessageCircle, IconHeart, IconShield } from "@tabler/icons-react"
import { StatsCard } from "@/components/common/stats-card"
import { StatsContainer } from "@/components/common/stats-container"

export function CommunityStats() {
  return (
    <StatsContainer>
      <StatsCard
        title="Total de Posts"
        value="14"
        trend={{
          value: "+18%",
          isPositive: true,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Crescimento da comunidade",
          detail: "2 novos posts esta semana",
          icon: IconMessageCircle
        }}
      />
      
      <StatsCard
        title="Membros Ativos"
        value="1.2K"
        trend={{
          value: "+25%",
          isPositive: true,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Engajamento alto",
          detail: "+150 novos membros",
          icon: IconUsers
        }}
      />
      
      <StatsCard
        title="Posts Moderados"
        value="3"
        trend={{
          value: "-12%",
          isPositive: true,
          icon: IconTrendingDown
        }}
        footer={{
          label: "Comunidade saudável",
          detail: "Menos violações",
          icon: IconShield
        }}
      />
      
      <StatsCard
        title="Interações Totais"
        value="892"
        trend={{
          value: "+15%",
          isPositive: true,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Comunidade engajada",
          detail: "Respostas e curtidas",
          icon: IconHeart
        }}
      />
    </StatsContainer>
  )
}
