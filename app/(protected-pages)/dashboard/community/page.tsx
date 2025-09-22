"use client"

import { ServerSideDataTable } from "@/components/common/server-side-data-table"
import { CommunityStats } from "@/components/community/communityStats"
import { communityColumns, type CommunityPostRow } from "@/components/community/community-columns"
import { useServerSideData } from "@/hooks/use-server-side-data"

export default function CommunityPage() {
  const {
    data: communityPosts,
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
  } = useServerSideData<CommunityPostRow>({
    endpoint: '/api/community',
    initialPageSize: 10,
  })

  if (error) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">Comunidade</h1>
                <p className="text-muted-foreground">
                  Gerencie posts, respostas e engajamento da comunidade.
                </p>
              </div>
            </div>
            <div className="px-4 lg:px-6">
              <div className="text-red-600">
                Erro ao carregar posts da comunidade: {error}
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
              <h1 className="text-2xl font-semibold tracking-tight">Comunidade</h1>
              <p className="text-muted-foreground">
                Gerencie posts, respostas e engajamento da comunidade.
                {!loading && (
                  <span className="ml-2 text-sm">
                    ({totalCount.toLocaleString()} posts totais)
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <CommunityStats />
          
          {/* Community Table */}
          <ServerSideDataTable
            columns={communityColumns}
            data={communityPosts}
            totalCount={totalCount}
            pageCount={pageCount}
            loading={loading}
            searchKey="title"
            searchPlaceholder="Buscar por título, conteúdo, autor ou tags..."
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
