import { IconTrendingDown, IconTrendingUp, IconCalendar } from "@tabler/icons-react"
import { StatsCard } from "@/components/common/stats-card"
import { StatsContainer } from "@/components/common/stats-container"

export function EventsStats() {
  return (
    <StatsContainer>
      <StatsCard
        title="Total Events"
        value="12"
        trend={{
          value: "+25%",
          isPositive: true,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Growing events portfolio",
          detail: "3 new events added this month",
          icon: IconCalendar
        }}
      />
      
      <StatsCard
        title="Total Registrations"
        value="1,847"
        trend={{
          value: "+18.2%",
          isPositive: true,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Strong registration growth",
          detail: "+284 registrations this month",
          icon: IconTrendingUp
        }}
      />
      
      <StatsCard
        title="Revenue Generated"
        value="R$89,520"
        trend={{
          value: "+22.1%",
          isPositive: true,
          icon: IconTrendingUp
        }}
        footer={{
          label: "Revenue targets exceeded",
          detail: "Above monthly projections",
          icon: IconTrendingUp
        }}
      />
      
      <StatsCard
        title="Average Attendance"
        value="87%"
        trend={{
          value: "-3.2%",
          isPositive: false,
          icon: IconTrendingDown
        }}
        footer={{
          label: "Slight attendance dip",
          detail: "Still above industry average",
          icon: IconTrendingDown
        }}
      />
    </StatsContainer>
  )
}
