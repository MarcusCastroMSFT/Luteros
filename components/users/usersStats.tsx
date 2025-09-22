import { IconUsers, IconUserPlus, IconUserCheck, IconCrown, IconTrendingUp } from "@tabler/icons-react";
import { StatsCard } from "@/components/common/stats-card";
import { StatsContainer } from "@/components/common/stats-container";

export function UsersStats() {
  return (
    <StatsContainer>
      <StatsCard
        title="Total de Usuários"
        value="2,847"
        trend={{
          value: "+12%",
          isPositive: true,
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
        value="234"
        trend={{
          value: "+8%",
          isPositive: true,
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
        value="2,156"
        description="75.7% do total"
        footer={{
          label: "Taxa de atividade",
          detail: "Acima da média do setor",
          icon: IconUserCheck
        }}
      />
      
      <StatsCard
        title="Usuários Premium"
        value="487"
        description="17.1% do total"
        footer={{
          label: "Assinantes premium",
          detail: "Receita recorrente estável",
          icon: IconCrown
        }}
      />
    </StatsContainer>
  );
}
