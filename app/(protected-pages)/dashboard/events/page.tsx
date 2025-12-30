"use client"

import { useState, useMemo } from "react"
import { ServerSideDataTable } from "@/components/common/server-side-data-table"
import { EventsStats } from "@/components/events/eventsStats"
import { createEventColumns, type Event } from "@/components/events/event-columns"
import { CreateEventModal } from "@/components/events/create-event-modal"
import { useServerSideData } from "@/hooks/use-server-side-data"

export default function EventsPage() {
  const [statsRefreshKey, setStatsRefreshKey] = useState(0)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const {
    data: events,
    setData,
    loading,
    error,
    totalCount,
    setTotalCount,
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

  const handleEventUpdate = () => {
    // Refresh stats when event is updated or deleted
    setStatsRefreshKey(prev => prev + 1)
  }

  const handleDeleteEvent = (eventId: string) => {
    // Optimistic update: remove event from table immediately
    setData(prevData => prevData.filter(event => event.id !== eventId))
    setTotalCount(prevCount => prevCount - 1)
    
    // Refresh stats to reflect the deletion
    setStatsRefreshKey(prev => prev + 1)
  }

  const eventColumns = useMemo(() => createEventColumns(handleEventUpdate), [handleEventUpdate])

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
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
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
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer"
                >
                  Novo Evento
                </button>
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <EventsStats refreshKey={statsRefreshKey} />
          
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
            meta={{ onDeleteEvent: handleDeleteEvent }}
          />
        </div>
      </div>

      <CreateEventModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          setStatsRefreshKey(prev => prev + 1)
          // Trigger refetch by updating search (will keep current value)
          setSearchValue(searchValue)
        }}
      />
    </div>
  )
}
