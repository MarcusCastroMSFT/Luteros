'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  fullName: string | null
  displayName: string | null
  avatar: string | null
  bio: string | null
  email?: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signUp: (email: string, password: string, metadata?: any) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Profile cache with TTL (5 minutes)
const PROFILE_CACHE_TTL = 5 * 60 * 1000
const profileCache = new Map<string, { profile: UserProfile; timestamp: number }>()

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  
  // Track if we're currently fetching profile to prevent duplicate requests
  const isFetchingProfile = useRef(false)
  // Track last fetch time to debounce rapid auth state changes
  const lastFetchTime = useRef(0)
  // Track the current user ID to prevent stale updates
  const currentUserIdRef = useRef<string | null>(null)

  const fetchUserProfile = useCallback(async (userId: string, forceRefresh = false) => {
    // Check cache first (unless forcing refresh)
    if (!forceRefresh) {
      const cached = profileCache.get(userId)
      if (cached && Date.now() - cached.timestamp < PROFILE_CACHE_TTL) {
        setUserProfile(cached.profile)
        return cached.profile
      }
    }

    // Debounce: skip if fetched within the last second
    const now = Date.now()
    if (!forceRefresh && now - lastFetchTime.current < 1000) {
      return null
    }
    
    // Prevent concurrent fetches
    if (isFetchingProfile.current) {
      return null
    }

    isFetchingProfile.current = true
    lastFetchTime.current = now

    try {
      const response = await fetch(`/api/users/${userId}/profile`)
      if (response.ok) {
        const profile = await response.json()
        // Update cache
        profileCache.set(userId, { profile, timestamp: Date.now() })
        // Only update state if this user is still the current user
        if (currentUserIdRef.current === userId) {
          setUserProfile(profile)
        }
        return profile
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      isFetchingProfile.current = false
    }
    return null
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchUserProfile(user.id, true)
    }
  }, [user, fetchUserProfile])

  useEffect(() => {
    // Get initial user using getUser() - this validates the JWT on first load
    const initAuth = async () => {
      try {
        // IMPORTANT: Use getUser() on initial load to validate the JWT with the server
        // This ensures the session hasn't been revoked
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        
        if (error || !currentUser) {
          setUser(null)
          setUserProfile(null)
          currentUserIdRef.current = null
          setIsLoading(false)
          return
        }

        setUser(currentUser)
        currentUserIdRef.current = currentUser.id
        
        // Fetch profile (will use cache if available)
        await fetchUserProfile(currentUser.id)
      } catch (error) {
        console.error('Error initializing auth:', error)
        setUser(null)
        setUserProfile(null)
        currentUserIdRef.current = null
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    // IMPORTANT: onAuthStateChange callback should NOT be async to avoid deadlocks
    // Use setTimeout to defer any async operations
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const newUser = session?.user ?? null
        const newUserId = newUser?.id ?? null
        const previousUserId = currentUserIdRef.current
        
        // Update user state synchronously (safe)
        setUser(newUser)
        currentUserIdRef.current = newUserId
        
        // Handle different events
        if (event === 'SIGNED_OUT') {
          setUserProfile(null)
          profileCache.clear()
          // Defer navigation to avoid deadlock
          setTimeout(() => {
            router.push('/login')
          }, 0)
        } else if (event === 'SIGNED_IN') {
          // Only fetch profile if user actually changed
          if (newUserId && newUserId !== previousUserId) {
            // Defer async operations to avoid deadlock
            setTimeout(() => {
              fetchUserProfile(newUserId)
            }, 0)
          }
          // Defer navigation
          setTimeout(() => {
            router.refresh()
          }, 0)
        } else if (event === 'TOKEN_REFRESHED') {
          // Token was refreshed by the middleware, no action needed
          // The user object is already updated in state
        } else if (event === 'USER_UPDATED') {
          // User data was updated, refresh profile
          if (newUserId) {
            setTimeout(() => {
              fetchUserProfile(newUserId, true)
            }, 0)
          }
        } else if (event === 'INITIAL_SESSION') {
          // Initial session loaded from storage
          // Only fetch profile if we don't have one yet
          if (newUserId && !userProfile) {
            setTimeout(() => {
              fetchUserProfile(newUserId)
            }, 0)
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/dashboard')
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
