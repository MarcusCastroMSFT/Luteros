"use client"

import { useState } from "react"
import Link from "next/link"
import { ServerSideDataTable } from "@/components/common/server-side-data-table"
import { PartnersStats } from "@/components/partners/partnersStats"
import { partnerColumns, type PartnerRow } from "@/components/partners/partner-columns"
import { useServerSideData } from "@/hooks/use-server-side-data"

export default function PartnersPage() {
  const [statsRefreshKey, setStatsRefreshKey] = useState(0)

  const {
    data: partners,
    setData,
    totalCount,
    setTotalCount,
    pageCount,
    loading,
    error,
    pageIndex,
    pageSize,
    sorting,
    columnFilters,
    searchValue,
    setPagination,
    setSorting,
    setColumnFilters,
    setSearchValue,
  } = useServerSideData<PartnerRow>({
    endpoint: '/api/partners',
    initialPageSize: 10,
  })

  const handleDeletePartner = (partnerId: string) => {
    // Optimistic update: remove partner from table immediately
    setData(prevData => prevData.filter(partner => partner.id !== partnerId))
    setTotalCount(prevCount => prevCount - 1)
    
    // Refresh stats to reflect the deletion
    setStatsRefreshKey(prev => prev + 1)
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <h3 className="text-sm font-medium text-destructive">Erro ao carregar parceiros</h3>
                <p className="text-sm text-destructive/80 mt-1">{error}</p>
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
                  <h1 className="text-2xl font-semibold tracking-tight">Parceiros</h1>
                  <p className="text-muted-foreground">
                    Gerencie os parceiros e fornecedores de produtos.
                    {!loading && (
                      <span className="ml-2 text-sm">
                        ({totalCount.toLocaleString()} parceiros totais)
                      </span>
                    )}
                  </p>
                </div>
                <Link 
                  href="/admin/partners/new"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer"
                >
                  Novo Parceiro
                </Link>
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <PartnersStats refreshKey={statsRefreshKey} />
          
          {/* Server-Side Partners Table */}
          <ServerSideDataTable
            columns={partnerColumns}
            data={partners}
            totalCount={totalCount}
            pageCount={pageCount}
            loading={loading}
            searchKey="name"
            searchPlaceholder="Buscar parceiros..."
            pageIndex={pageIndex}
            pageSize={pageSize}
            sorting={sorting}
            columnFilters={columnFilters}
            searchValue={searchValue}
            onPaginationChange={setPagination}
            onSortingChange={setSorting}
            onColumnFiltersChange={setColumnFilters}
            onSearchChange={setSearchValue}
          />
        </div>
      </div>
    </div>
  )
}
