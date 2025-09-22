import { IconTrendingUp, IconMail, IconEye, IconUsers, IconClick } from "@tabler/icons-react"
import { StatsCard } from "@/components/common/stats-card"
import { StatsContainer } from "@/components/common/stats-container"

export function NewsletterStats() {
  return (
    <StatsContainer>
      <StatsCard
        title="Total de Campanhas"
        value="16"
        trend={{
          value: "+20%",
          isPositive: true,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Crescimento das campanhas",
          detail: "3 novas campanhas este mês",
          icon: IconMail
        }}
      />
      
      <StatsCard
        title="Taxa de Abertura Média"
        value="67.8%"
        trend={{
          value: "+5.2%",
          isPositive: true,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Acima da média do setor",
          detail: "Engajamento crescente",
          icon: IconEye
        }}
      />
      
      <StatsCard
        title="Total de Assinantes"
        value="15.4K"
        trend={{
          value: "+12.8%",
          isPositive: true,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Base de assinantes ativa",
          detail: "+1.7K novos assinantes",
          icon: IconUsers
        }}
      />
      
      <StatsCard
        title="Taxa de Clique Média"
        value="14.2%"
        trend={{
          value: "+8.1%",
          isPositive: true,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Conversão otimizada",
          detail: "CTR acima da meta",
          icon: IconClick
        }}
      />
    </StatsContainer>
  )
}
