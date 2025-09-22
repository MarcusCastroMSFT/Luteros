// Shared API client that works for both Next.js and React Native
export interface APIClientConfig {
  baseURL: string
  platform: 'web' | 'mobile' | 'ios' | 'android'
  apiVersion?: string
  timeout?: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, string>
}

export class APIClient {
  private config: APIClientConfig
  private baseURL: string

  constructor(config: APIClientConfig) {
    this.config = config
    this.baseURL = `${config.baseURL}/api/${config.apiVersion || 'v1'}`
  }

  // Generic method that works for both fetch (web) and React Native
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Platform': this.config.platform,
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: defaultHeaders,
        // Add timeout for React Native
        ...(this.config.timeout && { 
          signal: AbortSignal.timeout(this.config.timeout) 
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API Request failed: ${url}`, error)
      throw error
    }
  }

  // Articles API methods
  async getArticles(params: PaginationParams = {}) {
    const searchParams = new URLSearchParams()
    
    // Add pagination parameters
    if (params.page !== undefined) searchParams.set('page', params.page.toString())
    if (params.pageSize !== undefined) searchParams.set('pageSize', params.pageSize.toString())
    if (params.search) searchParams.set('search', params.search)
    if (params.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
    
    // Add platform info
    searchParams.set('platform', this.config.platform)
    
    // Add filters
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        searchParams.set(`filter_${key}`, value)
      })
    }

    const query = searchParams.toString()
    return this.request(`/articles${query ? `?${query}` : ''}`)
  }

  async getEvents(params: PaginationParams = {}) {
    const searchParams = new URLSearchParams()
    
    if (params.page !== undefined) searchParams.set('page', params.page.toString())
    if (params.pageSize !== undefined) searchParams.set('pageSize', params.pageSize.toString())
    if (params.search) searchParams.set('search', params.search)
    if (params.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
    
    searchParams.set('platform', this.config.platform)
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        searchParams.set(`filter_${key}`, value)
      })
    }

    const query = searchParams.toString()
    return this.request(`/events${query ? `?${query}` : ''}`)
  }

  async getUsers(params: PaginationParams = {}) {
    const searchParams = new URLSearchParams()
    
    if (params.page !== undefined) searchParams.set('page', params.page.toString())
    if (params.pageSize !== undefined) searchParams.set('pageSize', params.pageSize.toString())
    if (params.search) searchParams.set('search', params.search)
    if (params.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
    
    searchParams.set('platform', this.config.platform)
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        searchParams.set(`filter_${key}`, value)
      })
    }

    const query = searchParams.toString()
    return this.request(`/users${query ? `?${query}` : ''}`)
  }
}

// Factory functions for different platforms
export const createWebAPIClient = (baseURL: string = '') => 
  new APIClient({
    baseURL: baseURL || (typeof window !== 'undefined' ? window.location.origin : ''),
    platform: 'web'
  })

export const createMobileAPIClient = (baseURL: string) => 
  new APIClient({
    baseURL,
    platform: 'mobile',
    timeout: 10000 // 10 second timeout for mobile
  })

// Usage examples:
// Web (Next.js): const api = createWebAPIClient()
// React Native: const api = createMobileAPIClient('https://yourdomain.com')
