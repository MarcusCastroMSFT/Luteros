"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { SortingState, ColumnFiltersState } from "@tanstack/react-table"

export interface UseServerSideDataParams {
  endpoint: string
  initialPageSize?: number
  initialSorting?: SortingState
  initialFilters?: ColumnFiltersState
  extraParams?: Record<string, string>
}

export interface ServerSideDataState<T> {
  data: T[]
  setData: React.Dispatch<React.SetStateAction<T[]>>
  totalCount: number
  setTotalCount: React.Dispatch<React.SetStateAction<number>>
  pageCount: number
  loading: boolean
  error: string | null
}

export interface ServerSideDataActions {
  pageIndex: number
  pageSize: number
  sorting: SortingState
  columnFilters: ColumnFiltersState
  searchValue: string
  setPagination: (pagination: { pageIndex: number; pageSize: number }) => void
  setSorting: (sorting: SortingState) => void
  setColumnFilters: (filters: ColumnFiltersState) => void
  setSearchValue: (search: string) => void
  refetch: () => void
}

export function useServerSideData<T>({
  endpoint,
  initialPageSize = 10,
  initialSorting = [],
  initialFilters = [],
  extraParams = {},
}: UseServerSideDataParams): ServerSideDataState<T> & ServerSideDataActions {
  const [data, setData] = useState<T[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialFilters)
  const [searchValue, setSearchValue] = useState("")
  
  // Use ref to track the actual search term being used for API calls
  const effectiveSearchRef = useRef("")
  
  // Track previous endpoint to detect changes
  const prevEndpointRef = useRef(endpoint)
  const extraParamsString = JSON.stringify(extraParams)
  
  // AbortController for request cancellation
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async (searchTerm: string, signal?: AbortSignal) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Create new AbortController for this request
    const controller = new AbortController()
    abortControllerRef.current = controller
    
    setLoading(true)
    setError(null)
    
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: pageIndex.toString(),
        pageSize: pageSize.toString(),
        search: searchTerm,
      })
      
      // Add extra params
      Object.entries(extraParams).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      
      // Add sorting parameters
      if (sorting.length > 0) {
        params.append('sortBy', sorting[0].id)
        params.append('sortOrder', sorting[0].desc ? 'desc' : 'asc')
      }
      
      // Add column filters
      columnFilters.forEach((filter) => {
        if (filter.value) {
          params.append(`filter_${filter.id}`, filter.value as string)
        }
      })
      
      // Build URL - handle endpoints that already have query params
      const separator = endpoint.includes('?') ? '&' : '?'
      const response = await fetch(`${endpoint}${separator}${params}`, {
        signal: signal || controller.signal,
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      setData(result.data || [])
      setTotalCount(result.totalCount || 0)
      setPageCount(result.pageCount || Math.ceil((result.totalCount || 0) / pageSize))
    } catch (err) {
      // Don't set error state if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      setError(err instanceof Error ? err.message : 'An error occurred')
      setData([])
      setTotalCount(0)
      setPageCount(0)
    } finally {
      setLoading(false)
    }
  }, [endpoint, pageIndex, pageSize, sorting, columnFilters])
  
  // Effect for handling endpoint or extraParams changes (reset and refetch)
  useEffect(() => {
    if (prevEndpointRef.current !== endpoint) {
      prevEndpointRef.current = endpoint
      setPageIndex(0) // Reset to first page when endpoint changes
      fetchData(effectiveSearchRef.current)
    }
  }, [endpoint, extraParamsString, fetchData])
  
  // Effect for handling pagination, sorting, and filters (immediate fetch)
  useEffect(() => {
    fetchData(effectiveSearchRef.current)
  }, [pageIndex, pageSize, sorting, columnFilters, fetchData])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])
  
  // Effect for handling search with 3-character minimum (debounced)
  useEffect(() => {
    const effectiveSearch = searchValue.length >= 3 ? searchValue : ''
    
    // Only fetch if the effective search term has changed
    if (effectiveSearch !== effectiveSearchRef.current) {
      // Debounce search to prevent excessive API calls
      const timeoutId = setTimeout(() => {
        effectiveSearchRef.current = effectiveSearch
        setPageIndex(0) // Reset to first page when search changes
        fetchData(effectiveSearch)
      }, 300)
      
      return () => clearTimeout(timeoutId)
    }
  }, [searchValue, fetchData])
  
  const setPagination = useCallback((newPagination: { pageIndex: number; pageSize: number }) => {
    setPageIndex(newPagination.pageIndex)
    setPageSize(newPagination.pageSize)
  }, [])
  
  const handleSetSearchValue = useCallback((search: string) => {
    setSearchValue(search)
    setPageIndex(0) // Reset to first page when searching
  }, [])
  
  const handleSetSorting = useCallback((newSorting: SortingState) => {
    setSorting(newSorting)
    setPageIndex(0) // Reset to first page when sorting changes
  }, [])
  
  const handleSetColumnFilters = useCallback((newFilters: ColumnFiltersState) => {
    setColumnFilters(newFilters)
    setPageIndex(0) // Reset to first page when filters change
  }, [])

  const refetch = useCallback(() => {
    fetchData(effectiveSearchRef.current)
  }, [fetchData])

  return {
    // State
    data,
    setData,
    totalCount,
    setTotalCount,
    pageCount,
    loading,
    error,
    
    // Current values
    pageIndex,
    pageSize,
    sorting,
    columnFilters,
    searchValue,
    
    // Actions
    setPagination,
    setSorting: handleSetSorting,
    setColumnFilters: handleSetColumnFilters,
    setSearchValue: handleSetSearchValue,
    refetch,
  }
}
