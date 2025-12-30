"use client"

import { useMemo } from "react"
import { ServerSideDataTable } from "@/components/common/server-side-data-table"
import { UsersStats } from "@/components/users/usersStats"
import { getUserColumns, type User } from "@/components/users/user-columns"
import { useServerSideData } from "@/hooks/use-server-side-data"

export default function UsersPage() {
  const {
    data: users,
    totalCount,
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
    refetch,
  } = useServerSideData<User>({
    endpoint: '/api/users',
    initialPageSize: 10,
  })

  const columns = useMemo(() => getUserColumns(refetch), [refetch])

  if (error) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <h3 className="text-sm font-medium text-destructive">Error loading users</h3>
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
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
              <p className="text-muted-foreground">
                Gerencie usuários da plataforma, monitore atividades e controle permissões de acesso.
                {!loading && (
                  <span className="ml-2 text-sm">
                    ({totalCount.toLocaleString()} usuários totais)
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <UsersStats />
          
          {/* Server-Side Users Table */}
          <ServerSideDataTable
            columns={columns}
            data={users}
            totalCount={totalCount}
            pageCount={pageCount}
            loading={loading}
            searchKey="name"
            searchPlaceholder="Buscar usuários..."
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
