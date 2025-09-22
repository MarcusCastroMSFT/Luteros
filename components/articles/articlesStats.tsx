import { IconTrendingUp, IconEdit, IconEye } from "@tabler/icons-react"
import { StatsCard } from "@/components/common/stats-card"
import { StatsContainer } from "@/components/common/stats-container"

export function ArticlesStats() {
  return (
    <StatsContainer>
      <StatsCard
        title="Total de Artigos"
        value="16"
        trend={{
          value: "+15%",
          isPositive: true,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Crescimento do conteúdo",
          detail: "2 novos artigos este mês",
          icon: IconEdit
        }}
      />
      
      <StatsCard
        title="Visualizações Totais"
        value="25,847"
        trend={{
          value: "+28.3%",
          isPositive: true,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Engajamento crescendo",
          detail: "+5,234 visualizações este mês",
          icon: IconEye
        }}
      />
      
      <StatsCard
        title="Artigos Ativos"
        value="14"
        trend={{
          value: "+12.5%",
          isPositive: true,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Conteúdo publicado",
          detail: "2 artigos em rascunho",
          icon: IconEdit
        }}
      />
      
      <StatsCard
        title="Comentários"
        value="592"
        trend={{
          value: "+31.2%",
          isPositive: true,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Engajamento da comunidade",
          detail: "+142 comentários este mês",
          icon: IconTrendingUp
        }}
      />
    </StatsContainer>
  )
}
