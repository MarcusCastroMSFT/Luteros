'use client'

import Link from 'next/link'
import { Inbox, RefreshCw } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { ServerSideDataTable } from '@/components/common/server-side-data-table'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useServerSideData } from '@/hooks/use-server-side-data'
import { contactReasonLabel, type ContactSummary } from '@/lib/contact'

const columns: ColumnDef<ContactSummary>[] = [
  {
    accessorKey: 'name',
    header: 'Remetente',
    cell: ({ row }) => (
      <div className="max-w-64">
        <p className="truncate font-medium">{row.original.name}</p>
        <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
      </div>
    ),
  },
  { accessorKey: 'reason', header: 'Motivo', cell: ({ row }) => contactReasonLabel(row.original.reason) },
  {
    accessorKey: 'subject',
    header: 'Assunto',
    cell: ({ row }) => <span className="block max-w-72 truncate">{row.original.subject || 'Sem assunto'}</span>,
  },
  {
    accessorKey: 'createdAt',
    header: 'Recebida em',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short',
    }),
  },
  {
    id: 'actions',
    header: 'Mensagem',
    cell: ({ row }) => (
      <Button asChild variant="outline" size="sm">
        <Link href={`/admin/contact/${row.original.id}`} aria-label={`Ler mensagem de ${row.original.name}`}>Ler mensagem</Link>
      </Button>
    ),
  },
]

export function ContactInbox() {
  const inbox = useServerSideData<ContactSummary>({ endpoint: '/api/admin/contact' })
  return (
    <div className="flex flex-1 flex-col gap-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex items-start gap-3">
          <SidebarTrigger className="md:hidden" aria-label="Abrir navegação" />
          <span className="rounded-xl bg-primary/10 p-3 text-primary"><Inbox className="size-5" aria-hidden="true" /></span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Mensagens de contato</h1>
            <p className="mt-1 text-sm text-muted-foreground">Mensagens recebidas pelo site, da mais recente para a mais antiga.</p>
            <p className="mt-1 text-xs text-muted-foreground">Acesso exclusivo de administradores. Horários de Brasília.</p>
          </div>
        </div>
        <Button variant="outline" onClick={inbox.refetch} disabled={inbox.loading}>
          <RefreshCw className="size-4" aria-hidden="true" /> Atualizar
        </Button>
      </div>
      {inbox.error ? (
        <div role="alert" className="mx-4 rounded-xl border border-destructive/30 bg-destructive/5 p-5 lg:mx-6">
          <p className="font-medium text-destructive">Não foi possível carregar as mensagens.</p>
          <p className="mt-1 text-sm text-muted-foreground">Verifique sua conexão e tente atualizar a lista.</p>
        </div>
      ) : (
        <ServerSideDataTable
          columns={columns} data={inbox.data} totalCount={inbox.totalCount} pageCount={inbox.pageCount}
          loading={inbox.loading} searchKey="email" searchPlaceholder="Nome, e-mail ou assunto"
          searchValue={inbox.searchValue} onSearchChange={inbox.setSearchValue}
          pageIndex={inbox.pageIndex} pageSize={inbox.pageSize} onPaginationChange={inbox.setPagination}
          sorting={inbox.sorting} onSortingChange={inbox.setSorting}
          emptyMessage="Nenhuma mensagem encontrada."
        />
      )}
    </div>
  )
}
