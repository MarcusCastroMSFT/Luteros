"use client"

import { ServerSideDataTable } from "@/components/common/server-side-data-table"
import { EventsStats } from "@/components/events/eventsStats"
import { eventColumns, type Event } from "@/components/events/event-columns"
import { useServerSideData } from "@/hooks/use-server-side-data"

export default function EventsPage() {
  const {
    data: events,
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
  } = useServerSideData<Event>({
    endpoint: '/api/events',
    initialPageSize: 10,
  })

  if (error) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">Eventos</h1>
                <p className="text-muted-foreground">
                  Gerencie e monitore seus eventos, inscrições e métricas de desempenho.
                </p>
              </div>
            </div>
            <div className="px-4 lg:px-6">
              <div className="text-red-600">
                Erro ao carregar eventos: {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Page Header */}
          <div className="px-4 lg:px-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">Eventos</h1>
              <p className="text-muted-foreground">
                Gerencie e monitore seus eventos, inscrições e métricas de desempenho.
                {!loading && (
                  <span className="ml-2 text-sm">
                    ({totalCount.toLocaleString()} eventos totais)
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <EventsStats />
          
          {/* Events Table */}
          <ServerSideDataTable
            columns={eventColumns}
            data={events}
            totalCount={totalCount}
            pageCount={pageCount}
            loading={loading}
            searchKey="header"
            searchPlaceholder="Buscar eventos..."
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
  )
}
