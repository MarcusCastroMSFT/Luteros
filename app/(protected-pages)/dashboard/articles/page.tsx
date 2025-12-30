"use client"

import { useState } from "react"
import Link from "next/link"
import { ServerSideDataTable } from "@/components/common/server-side-data-table"
import { ArticlesStats } from "@/components/articles/articlesStats"
import { articleColumns, type ArticleRow } from "@/components/articles/article-columns"
import { useServerSideData } from "@/hooks/use-server-side-data"

export default function ArticlesPage() {
  const [statsRefreshKey, setStatsRefreshKey] = useState(0)

  const {
    data: articles,
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
  } = useServerSideData<ArticleRow>({
    endpoint: '/api/articles',
    initialPageSize: 10,
  })

  const handleDeleteArticle = (articleId: string) => {
    // Optimistic update: remove article from table immediately
    setData(prevData => prevData.filter(article => article.id !== articleId))
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
                <h3 className="text-sm font-medium text-destructive">Erro ao carregar artigos</h3>
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
                  <h1 className="text-2xl font-semibold tracking-tight">Artigos</h1>
                  <p className="text-muted-foreground">
                    Gerencie artigos educativos, monitore engagement e controle publicações de conteúdo.
                    {!loading && (
                      <span className="ml-2 text-sm">
                        ({totalCount.toLocaleString()} artigos totais)
                      </span>
                    )}
                  </p>
                </div>
                <Link 
                  href="/dashboard/articles/new"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer"
                >
                  Novo Artigo
                </Link>
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <ArticlesStats refreshKey={statsRefreshKey} />
          
          {/* Server-Side Articles Table */}
          <ServerSideDataTable
            columns={articleColumns}
            data={articles}
            totalCount={totalCount}
            pageCount={pageCount}
            loading={loading}
            searchKey="title"
            searchPlaceholder="Buscar artigos..."
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
            meta={{ onDeleteArticle: handleDeleteArticle }}
          />
        </div>
      </div>
    </div>
  )
}
