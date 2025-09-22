"use client"

import { ServerSideDataTable } from "@/components/common/server-side-data-table"
import { CoursesStats } from "@/components/courses/courses-stats"
import { coursesColumns, type CourseRow } from "@/components/courses/courses-columns"
import { useServerSideData } from "@/hooks/use-server-side-data"

export default function CoursesPage() {
  const {
    data: courses,
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
  } = useServerSideData<CourseRow>({
    endpoint: '/api/courses',
    initialPageSize: 10,
  })

  if (error) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">Cursos</h1>
                <p className="text-muted-foreground">
                  Gerencie seus cursos e programas educacionais.
                </p>
              </div>
            </div>
            <div className="px-4 lg:px-6">
              <div className="text-red-600">
                Erro ao carregar cursos: {error}
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
              <h1 className="text-2xl font-semibold tracking-tight">Cursos</h1>
              <p className="text-muted-foreground">
                Gerencie seus cursos e programas educacionais.
                {!loading && (
                  <span className="ml-2 text-sm">
                    ({totalCount.toLocaleString()} cursos totais)
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <CoursesStats />
          
          {/* Courses Table */}
          <ServerSideDataTable
            columns={coursesColumns}
            data={courses}
            totalCount={totalCount}
            pageCount={pageCount}
            loading={loading}
            searchKey="title"
            searchPlaceholder="Buscar por título, instrutor, categoria..."
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
