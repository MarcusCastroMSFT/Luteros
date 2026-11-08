'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { CourseSalesPanel } from '@/components/admin/course-sales-panel'
import type { CourseSalesSummary } from '@/lib/course-sales'

// Client-side loader for pages that are client components (the courses table page).
// Non-admins get a 403 and simply see nothing.
export function CourseSalesLoader() {
  const [data, setData] = useState<CourseSalesSummary | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'hidden' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/course-sales')
      .then(async (response) => {
        if (response.status === 401 || response.status === 403) return { hidden: true as const }
        const body = await response.json()
        if (!response.ok || !body.success) throw new Error(body.error || 'Falha ao carregar as vendas.')
        return { data: body.data as CourseSalesSummary }
      })
      .then((result) => {
        if (cancelled) return
        if ('hidden' in result) return setState('hidden')
        setData(result.data)
        setState('ready')
      })
      .catch(() => !cancelled && setState('error'))
    return () => {
      cancelled = true
    }
  }, [])

  if (state === 'hidden') return null
  if (state === 'loading') return <Skeleton className="h-96 w-full rounded-xl" />
  if (state === 'error' || !data) {
    return (
      <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">
        Não foi possível carregar as vendas agora. Atualize a página para tentar de novo.
      </div>
    )
  }
  return <CourseSalesPanel data={data} />
}
