'use client'

import { Download, Hourglass, RefreshCw } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { ServerSideDataTable } from '@/components/common/server-side-data-table'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useServerSideData } from '@/hooks/use-server-side-data'
import { waitlistAudienceLabel } from '@/lib/waitlist'

interface WaitlistEntry {
  id: string
  email: string
  audience: string | null
  source: string | null
  createdAt: string
}

interface WaitlistSummary {
  total: number
  doctors: number
  general: number
  lastWeek: number
}

const columns: ColumnDef<WaitlistEntry>[] = [
  { accessorKey: 'email', header: 'E-mail', cell: ({ row }) => <span className="font-medium">{row.original.email}</span> },
  { accessorKey: 'audience', header: 'Perfil', cell: ({ row }) => waitlistAudienceLabel(row.original.audience) },
  {
    accessorKey: 'source',
    header: 'Origem',
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.source || '—'}</span>,
  },
  {
    accessorKey: 'createdAt',
    header: 'Entrou em',
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short',
      }),
  },
]

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export function WaitlistAdmin({ summary }: { summary: WaitlistSummary }) {
  const list = useServerSideData<WaitlistEntry>({ endpoint: '/api/admin/waitlist' })

  return (
    <div className="flex flex-1 flex-col gap-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex items-start gap-3">
          <SidebarTrigger className="md:hidden" aria-label="Abrir navegação" />
          <span className="rounded-xl bg-primary/10 p-3 text-primary"><Hourglass className="size-5" aria-hidden="true" /></span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Lista de espera</h1>
            <p className="mt-1 text-sm text-muted-foreground">Pessoas que pediram aviso quando a assinatura dos artigos de acesso pago abrir.</p>
            <p className="mt-1 text-xs text-muted-foreground">Acesso exclusivo de administradores. Horários de Brasília.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={list.refetch} disabled={list.loading}>
            <RefreshCw className="size-4" aria-hidden="true" /> Atualizar
          </Button>
          <Button asChild>
            <a href="/api/admin/waitlist/export" download>
              <Download className="size-4" aria-hidden="true" /> Exportar CSV
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 lg:grid-cols-4 lg:px-6">
        <Stat label="Na lista" value={summary.total} />
        <Stat label="Profissionais de saúde" value={summary.doctors} />
        <Stat label="Outro interesse" value={summary.general} />
        <Stat label="Nos últimos 7 dias" value={summary.lastWeek} />
      </div>

      {list.error ? (
        <div role="alert" className="mx-4 rounded-xl border border-destructive/30 bg-destructive/5 p-5 lg:mx-6">
          <p className="font-medium text-destructive">Não foi possível carregar a lista de espera.</p>
          <p className="mt-1 text-sm text-muted-foreground">Verifique sua conexão e tente atualizar a lista.</p>
        </div>
      ) : (
        <ServerSideDataTable
          columns={columns} data={list.data} totalCount={list.totalCount} pageCount={list.pageCount}
          loading={list.loading} searchKey="email" searchPlaceholder="Buscar por e-mail"
          searchValue={list.searchValue} onSearchChange={list.setSearchValue}
          pageIndex={list.pageIndex} pageSize={list.pageSize} onPaginationChange={list.setPagination}
          sorting={list.sorting} onSortingChange={list.setSorting}
          emptyMessage="Ninguém entrou na lista de espera ainda."
        />
      )}
    </div>
  )
}
