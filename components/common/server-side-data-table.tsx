"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLayoutColumns,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface ServerSideTableData<TData> {
  data: TData[]
  totalCount: number
  pageCount: number
}

interface ServerSideDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  
  // Server-side data
  data: TData[]
  totalCount: number
  pageCount: number
  loading?: boolean
  
  // Search
  searchKey?: string
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  
  // Pagination
  pageIndex: number
  pageSize: number
  onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => void
  
  // Sorting
  sorting: SortingState
  onSortingChange: (sorting: SortingState) => void
  
  // Column Filters (optional)
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void
  
  // Manual control flags
  manualPagination?: boolean
  manualSorting?: boolean
  manualFiltering?: boolean
  
  // Table meta for passing custom data to cells
  meta?: any
}

export function ServerSideDataTable<TData, TValue>({
  columns,
  data,
  totalCount,
  pageCount,
  loading = false,
  searchKey,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  pageIndex,
  pageSize,
  onPaginationChange,
  sorting,
  onSortingChange,
  columnFilters = [],
  onColumnFiltersChange,
  manualPagination = true,
  manualSorting = true,
  manualFiltering = true,
  meta,
}: ServerSideDataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  // Pagination state for TanStack Table
  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  )

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: (updaterOrValue) => {
      const newSorting = typeof updaterOrValue === 'function' 
        ? updaterOrValue(sorting) 
        : updaterOrValue
      onSortingChange(newSorting)
    },
    onColumnFiltersChange: onColumnFiltersChange ? (updaterOrValue) => {
      const newFilters = typeof updaterOrValue === 'function' 
        ? updaterOrValue(columnFilters) 
        : updaterOrValue
      onColumnFiltersChange(newFilters)
    } : undefined,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updaterOrValue) => {
      const newPagination = typeof updaterOrValue === 'function' 
        ? updaterOrValue(pagination) 
        : updaterOrValue
      onPaginationChange(newPagination)
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination,
    manualSorting,
    manualFiltering,
    meta,
  })

  // Debounced search
  const [searchTerm, setSearchTerm] = React.useState(searchValue)
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange && searchTerm !== searchValue) {
        onSearchChange(searchTerm)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [searchTerm, onSearchChange, searchValue])

  return (
    <div className="px-4 lg:px-6">
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center space-x-2">
            {searchKey && onSearchChange && (
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-8 w-[150px] lg:w-[250px]"
                disabled={loading}
              />
            )}
          </div>
          
          {/* Column Visibility Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="cursor-pointer">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Personalizar Colunas</span>
                <span className="lg:hidden">Colunas</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  // Portuguese labels for column names
                  const columnLabels: Record<string, string> = {
                    title: "Título",
                    header: "Evento",
                    author: "Autor",
                    type: "Tipo",
                    category: "Categoria",
                    status: "Status",
                    paid: "Tipo",
                    audience: "Público",
                    location: "Local",
                    date: "Data",
                    time: "Horário",
                    target: "Inscritos",
                    limit: "Limite",
                    reviewer: "Responsável",
                    readTime: "Tempo de Leitura",
                    commentCount: "Comentários",
                  }
                  
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {columnLabels[column.id] || column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                // Enhanced loading skeleton for users
                Array.from({ length: pageSize }).map((_, index) => (
                  <TableRow key={index}>
                    {columns.map((column, colIndex) => {
                      // Get the column accessor key to determine what type of content to show
                      const columnId = column.id || ((column as { accessorKey?: string }).accessorKey || `col-${colIndex}`)
                      
                      return (
                        <TableCell key={colIndex} className="py-3">
                          {(() => {
                            // Customize skeleton based on column type
                            switch (columnId) {
                              case 'name':
                                return (
                                  <div className="flex items-center space-x-3">
                                    {/* Avatar skeleton */}
                                    <div className="h-8 w-8 bg-muted animate-pulse rounded-full flex-shrink-0" />
                                    <div className="space-y-1">
                                      {/* Name skeleton */}
                                      <div className="h-4 bg-muted animate-pulse rounded w-24" />
                                      {/* Username skeleton */}
                                      <div className="h-3 bg-muted/70 animate-pulse rounded w-16" />
                                    </div>
                                  </div>
                                )
                              case 'email':
                                return <div className="h-4 bg-muted animate-pulse rounded w-40" />
                              case 'status':
                                return <div className="h-6 bg-muted animate-pulse rounded-full w-16" />
                              case 'role':
                                return <div className="h-6 bg-muted animate-pulse rounded w-20" />
                              case 'actions':
                                return <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                              default:
                                return <div className="h-4 bg-muted animate-pulse rounded w-20" />
                            }
                          })()}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {loading ? (
              "Loading..."
            ) : (
              <>
                Showing {pageIndex * pageSize + 1} to{" "}
                {Math.min((pageIndex + 1) * pageSize, totalCount)} of {totalCount} entries
                {table.getFilteredSelectedRowModel().rows.length > 0 && (
                  <span className="ml-2">
                    ({table.getFilteredSelectedRowModel().rows.length} selected)
                  </span>
                )}
              </>
            )}
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${pageSize}`}
                onValueChange={(value) => {
                  onPaginationChange({
                    pageIndex: 0, // Reset to first page when changing page size
                    pageSize: Number(value),
                  })
                }}
                disabled={loading}
              >
                <SelectTrigger size="sm" className="w-20 cursor-pointer" id="rows-per-page">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50, 100].map((size) => (
                    <SelectItem key={size} value={`${size}`} className="cursor-pointer">
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Página {pageIndex + 1} de {pageCount}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0 cursor-pointer"
                onClick={() => onPaginationChange({ pageIndex: 0, pageSize })}
                disabled={!table.getCanPreviousPage() || loading}
              >
                <span className="sr-only">Ir para primeira página</span>
                <IconChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0 cursor-pointer"
                onClick={() =>
                  onPaginationChange({ pageIndex: pageIndex - 1, pageSize })
                }
                disabled={!table.getCanPreviousPage() || loading}
              >
                <span className="sr-only">Ir para página anterior</span>
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0 cursor-pointer"
                onClick={() =>
                  onPaginationChange({ pageIndex: pageIndex + 1, pageSize })
                }
                disabled={!table.getCanNextPage() || loading}
              >
                <span className="sr-only">Ir para próxima página</span>
                <IconChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0 cursor-pointer"
                onClick={() =>
                  onPaginationChange({ pageIndex: pageCount - 1, pageSize })
                }
                disabled={!table.getCanNextPage() || loading}
              >
                <span className="sr-only">Ir para última página</span>
                <IconChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
