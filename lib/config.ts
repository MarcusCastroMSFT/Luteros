// Environment configuration that works for both platforms
export interface AppConfig {
  apiBaseURL: string
  apiVersion: string
  platform: 'web' | 'mobile'
  environment: 'development' | 'staging' | 'production'
  features: {
    offline: boolean
    push: boolean
    analytics: boolean
  }
}

// Web configuration (Next.js)
export const webConfig: AppConfig = {
  apiBaseURL: process.env.NEXT_PUBLIC_API_URL || '',
  apiVersion: 'v1',
  platform: 'web',
  environment: (process.env.NODE_ENV as 'development' | 'production') === 'production' ? 'production' : 'development',
  features: {
    offline: false,
    push: false,
    analytics: true
  }
}

// Mobile configuration (React Native)
export const mobileConfig: AppConfig = {
  apiBaseURL: process.env.EXPO_PUBLIC_API_URL || 'https://yourdomain.com',
  apiVersion: 'v1', 
  platform: 'mobile',
  environment: (process.env.NODE_ENV as 'development' | 'production') === 'production' ? 'production' : 'development',
  features: {
    offline: true,  // Mobile typically needs offline support
    push: true,     // Mobile has push notifications
    analytics: true
  }
}

// Get config based on platform
export const getConfig = (): AppConfig => {
  // Check if running in React Native
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return mobileConfig
  }
  
  // Default to web config
  return webConfig
}

// API endpoints that both platforms will use
export const API_ENDPOINTS = {
  articles: '/articles',
  events: '/events', 
  users: '/users',
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh'
  }
} as const
