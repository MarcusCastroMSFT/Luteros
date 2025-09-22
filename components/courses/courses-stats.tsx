import { IconTrendingUp, IconBook, IconUsers, IconStar, IconCertificate } from "@tabler/icons-react"
import { StatsCard } from "@/components/common/stats-card"
import { StatsContainer } from "@/components/common/stats-container"

export function CoursesStats() {
  return (
    <StatsContainer>
      <StatsCard
        title="Total de Cursos"
        value="15"
        trend={{
          value: "+25%",
          isPositive: true,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Crescimento dos cursos",
          detail: "4 novos cursos este mês",
          icon: IconBook
        }}
      />
      
      <StatsCard
        title="Total de Alunos"
        value="89.2K"
        trend={{
          value: "+18.3%",
          isPositive: true,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Base de alunos ativa",
          detail: "+12.8K novos alunos",
          icon: IconUsers
        }}
      />
      
      <StatsCard
        title="Avaliação Média"
        value="4.7"
        trend={{
          value: "+0.2",
          isPositive: true,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Satisfação dos alunos",
          detail: "Baseado em 8.7K avaliações",
          icon: IconStar
        }}
      />
      
      <StatsCard
        title="Taxa de Conclusão"
        value="78.4%"
        trend={{
          value: "+5.1%",
          isPositive: true,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Alunos que completaram",
          detail: "Alta taxa de engajamento",
          icon: IconCertificate
        }}
      />
    </StatsContainer>
  )
}
