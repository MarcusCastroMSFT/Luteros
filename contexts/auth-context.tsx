'use client'

import { createContext, useContext, useCallback } from 'react'
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { refreshStoredProfile } from '@/lib/auth-session'

interface UserProfile {
  id: string
  name: string | null
  displayName: string | null
  image: string | null
  bio?: string | null
  email?: string | null
  role?: 'ADMIN' | 'INSTRUCTOR' | 'USER' | 'PROFESSIONAL'
}

interface AuthContextType {
  user: UserProfile | null
  userProfile: UserProfile | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signUp: (email: string, password: string, metadata?: Record<string, string>) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const isLoading = status === 'loading'

  const user: UserProfile | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name ?? null,
        displayName: session.user.displayName ?? null,
        image: session.user.image ?? null,
        email: session.user.email ?? null,
        role: (session.user.role as UserProfile['role']) ?? 'USER',
      }
    : null

  const refreshProfile = useCallback(async () => {
    await refreshStoredProfile(update)
  }, [update])

  const signIn = async (email: string, password: string) => {
    const result = await nextAuthSignIn('credentials', {
      email,
      password,
      redirect: false,
    })
    if (result?.error) {
      throw new Error(result.error)
    }
    // Refresh session so role-based redirect uses fresh data
    const updated = await update()
    const role = updated?.user?.role as string | undefined
    const params = new URLSearchParams(window.location.search)
    const redirectTo = params.get('redirectTo')
    const fallback = role === 'ADMIN' || role === 'INSTRUCTOR' ? '/admin' : '/'
    const destination = redirectTo?.startsWith('/') ? redirectTo : fallback
    router.push(destination)
  }

  const signInWithGoogle = async () => {
    const params = new URLSearchParams(window.location.search)
    const redirectTo = params.get('redirectTo')
    // Google sign-ups create USER-role accounts; default to home so the
    // middleware doesn't bounce them out of /admin.
    const callbackUrl = redirectTo?.startsWith('/') ? redirectTo : '/'
    await nextAuthSignIn('google', { callbackUrl })
  }

  const signUp = async (email: string, password: string, metadata?: Record<string, string>) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: metadata?.full_name }),
    })
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to create account')
    }
    await nextAuthSignIn('credentials', { email, password, redirect: false })
    await update()
  }

  const signOut = async () => {
    await nextAuthSignOut({ callbackUrl: '/login' })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile: user,
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
