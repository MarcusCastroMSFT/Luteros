"use client"

import { useMemo } from "react"
import { ServerSideDataTable } from "@/components/common/server-side-data-table"
import { SubscribersStats } from "@/components/newsletter/subscribersStats"
import { 
  getSubscriberColumns, 
  SubscriberStatusProvider,
  type Subscriber 
} from "@/components/newsletter/subscriber-columns"
import { useServerSideData } from "@/hooks/use-server-side-data"

export default function NewsletterPage() {
  const {
    data: subscribers,
    loading,
    error,
    totalCount,
    pageCount,
    pageIndex,
    pageSize,
    sorting,
    columnFilters,
    searchValue,
    setPagination,
    setSorting,
    setColumnFilters,
    setSearchValue,
  } = useServerSideData<Subscriber>({
    endpoint: '/api/newsletter/subscribers',
    initialPageSize: 10,
  })

  const columns = useMemo(() => getSubscriberColumns(), [])

  if (error) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">Newsletter</h1>
                <p className="text-muted-foreground">
                  Gerencie os inscritos da sua newsletter.
                </p>
              </div>
            </div>
            <div className="px-4 lg:px-6">
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <h3 className="text-sm font-medium text-destructive">Erro ao carregar inscritos</h3>
                <p className="text-sm text-destructive/80 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <SubscriberStatusProvider>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Page Header */}
            <div className="px-4 lg:px-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">Newsletter</h1>
                <p className="text-muted-foreground">
                  Gerencie os inscritos da sua newsletter e acompanhe as métricas de crescimento.
                  {!loading && (
                    <span className="ml-2 text-sm">
                      ({totalCount.toLocaleString()} inscritos totais)
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Stats Cards */}
            <SubscribersStats />
            
            {/* Subscribers Table */}
            <ServerSideDataTable
              columns={columns}
              data={subscribers}
              totalCount={totalCount}
              pageCount={pageCount}
              loading={loading}
              searchKey="email"
              searchPlaceholder="Buscar por email..."
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              pageIndex={pageIndex}
              pageSize={pageSize}
              onPaginationChange={setPagination}
              sorting={sorting}
              onSortingChange={setSorting}
              columnFilters={columnFilters}
              onColumnFiltersChange={setColumnFilters}
              manualPagination={true}
              manualSorting={true}
              manualFiltering={true}
            />
          </div>
        </div>
      </div>
    </SubscriberStatusProvider>
  )
}
