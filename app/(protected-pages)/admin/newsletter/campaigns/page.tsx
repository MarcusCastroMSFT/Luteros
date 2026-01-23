"use client"

import { useMemo, useState, useCallback } from "react"
import { ServerSideDataTable } from "@/components/common/server-side-data-table"
import { CampaignStats } from "@/components/newsletter/campaigns/campaign-stats"
import { getCampaignColumns, type Campaign } from "@/components/newsletter/campaigns/campaign-columns"
import { CampaignDialog } from "@/components/newsletter/campaigns/campaign-dialog-new"
import { useServerSideData } from "@/hooks/use-server-side-data"
import { Button } from "@/components/ui/button"
import { IconPlus } from "@tabler/icons-react"

export default function CampaignsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)

  const {
    data: campaigns,
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
    refetch,
  } = useServerSideData<Campaign>({
    endpoint: '/api/newsletter/campaigns',
    initialPageSize: 10,
  })

  const handleEdit = useCallback((campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setDialogOpen(true)
  }, [])

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  const handleNewCampaign = useCallback(() => {
    setSelectedCampaign(null)
    setDialogOpen(true)
  }, [])

  const handleDialogSuccess = useCallback(() => {
    refetch()
    setSelectedCampaign(null)
  }, [refetch])

  const columns = useMemo(
    () => getCampaignColumns(handleEdit, handleRefresh), 
    [handleEdit, handleRefresh]
  )

  if (error) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">Campanhas</h1>
                <p className="text-muted-foreground">
                  Crie e gerencie campanhas de email para sua newsletter.
                </p>
              </div>
            </div>
            <div className="px-4 lg:px-6">
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <h3 className="text-sm font-medium text-destructive">Erro ao carregar campanhas</h3>
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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Campanhas</h1>
                <p className="text-muted-foreground">
                  Crie e gerencie campanhas de email para sua newsletter.
                  {!loading && (
                    <span className="ml-2 text-sm">
                      ({totalCount} campanhas)
                    </span>
                  )}
                </p>
              </div>
              <Button onClick={handleNewCampaign} className="cursor-pointer">
                <IconPlus className="mr-2 h-4 w-4" />
                Nova Campanha
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <CampaignStats />
          
          {/* Campaigns Table */}
          <ServerSideDataTable
            columns={columns}
            data={campaigns}
            totalCount={totalCount}
            pageCount={pageCount}
            loading={loading}
            searchKey="name"
            searchPlaceholder="Buscar por nome..."
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

      <CampaignDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        campaign={selectedCampaign}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}
