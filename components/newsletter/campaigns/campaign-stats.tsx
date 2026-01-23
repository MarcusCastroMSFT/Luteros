"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconMail, IconMailFast, IconClock, IconFileText } from "@tabler/icons-react"
import { Skeleton } from "@/components/ui/skeleton"

interface CampaignStats {
  totalCampaigns: number
  draftCampaigns: number
  sentCampaigns: number
  scheduledCampaigns: number
  campaignsThisMonth: number
  totalEmailsSent: number
  totalEmailsFailed: number
  deliveryRate: number
}

export function CampaignStats() {
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/newsletter/campaigns/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching campaign stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Campanhas
            </CardTitle>
            <IconMail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {stats.campaignsThisMonth} criadas este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Campanhas Enviadas
            </CardTitle>
            <IconMailFast className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sentCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalEmailsSent.toLocaleString()} emails enviados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Agendadas
            </CardTitle>
            <IconClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              aguardando envio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rascunhos
            </CardTitle>
            <IconFileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draftCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {stats.deliveryRate}% taxa de entrega
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
