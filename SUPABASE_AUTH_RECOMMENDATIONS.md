# Supabase Auth Implementation - Critical Recommendations

**Date:** December 6, 2025  
**Project:** Luteros Learning Platform  
**Current Status:** ⚠️ **NOT FOLLOWING BEST PRACTICES**

---

## 🚨 CRITICAL ISSUES FOUND

### 1. Not Using Supabase Auth SDK
**Current State:** Using mock localStorage-based authentication in `contexts/auth-context.tsx`  
**Risk Level:** 🔴 **CRITICAL**

**Issue:**
- Currently simulating auth with localStorage
- No real JWT validation
- Sessions can be easily spoofed
- No secure cookie management

### 2. Missing Required Packages
**Risk Level:** 🔴 **CRITICAL**

**Missing:**
```bash
@supabase/supabase-js
@supabase/ssr
```

**Current package.json** does NOT include these essential packages.

### 3. No Server-Side Auth Implementation
**Risk Level:** 🔴 **CRITICAL**

**Missing Files:**
- `lib/supabase/client.ts` - Browser client for Client Components
- `lib/supabase/server.ts` - Server client for Server Components/Actions
- `lib/supabase/middleware.ts` - Middleware utilities
- `middleware.ts` - Next.js middleware for token refresh

### 4. Not Using getClaims() Method
**Risk Level:** 🔴 **CRITICAL**

**According to Supabase Official Documentation:**

> ⚠️ **Be careful when protecting pages. The server gets the user session from the cookies, which can be spoofed by anyone.**
>
> **Always use `supabase.auth.getClaims()` to protect pages and user data.**
>
> **Never trust `supabase.auth.getSession()` inside server code such as Middleware.** It isn't guaranteed to revalidate the Auth token.
>
> **It's safe to trust `getClaims()` because it validates the JWT signature against the project's published public keys every time.**

**Current Code:** Not using either method - using localStorage mock

---

## ✅ REQUIRED IMPLEMENTATION

### Phase 1: Install Dependencies

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

### Phase 2: Create Supabase Client Utilities

#### A. Browser Client (`lib/supabase/client.ts`)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Usage:** Client Components only (browser-side)

#### B. Server Client (`lib/supabase/server.ts`)

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

**Usage:** Server Components, Server Actions, Route Handlers

#### C. Middleware Utilities (`lib/supabase/middleware.ts`)

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // CRITICAL: This refreshes the session
  // Uses getClaims() internally to validate JWT
  await supabase.auth.getClaims()

  return supabaseResponse
}
```

### Phase 3: Create Middleware (`middleware.ts`)

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Purpose:** Automatically refreshes auth tokens on every request using `getClaims()`

### Phase 4: Replace AuthContext

**Current:** `contexts/auth-context.tsx` with localStorage mock  
**Required:** Complete rewrite to use Supabase Auth

```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  userMetadata: any | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signUp: (email: string, password: string, metadata?: any) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userMetadata, setUserMetadata] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        setUserMetadata(session?.user?.user_metadata ?? null)
      } catch (error) {
        console.error('Error fetching session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setUserMetadata(session?.user?.user_metadata ?? null)
        
        if (event === 'SIGNED_IN') {
          router.refresh()
        } else if (event === 'SIGNED_OUT') {
          router.push('/login')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

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
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
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
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
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
        userMetadata,
        isLoading,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

### Phase 5: Server-Side User Fetching (BEST PRACTICE)

**For Protected Server Components:**

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // ✅ CORRECT: Using getClaims() - validates JWT signature
  const { data: { user }, error } = await supabase.auth.getClaims()
  
  if (error || !user) {
    redirect('/login')
  }

  // User is now verified and safe to use
  // Pass user as prop to client components
  return (
    <div>
      <h1>Welcome {user.email}</h1>
      <UserProfile user={user} />
    </div>
  )
}
```

**❌ WRONG (Security Risk):**
```typescript
// DON'T DO THIS - Session can be spoofed!
const { data: { session } } = await supabase.auth.getSession()
```

### Phase 6: OAuth Callback Route

**Create:** `app/auth/callback/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}/dashboard`)
}
```

---

## 🔐 CUSTOM CLAIMS & RBAC (Advanced)

### Why Custom Claims?

Custom claims allow you to:
1. **Store user roles** (admin, instructor, student)
2. **Implement RBAC** (Role-Based Access Control)
3. **Enforce permissions** in Row Level Security (RLS)
4. **Access roles without database queries**

### Implementation Steps:

#### 1. Create User Roles Table

```sql
-- Custom types
CREATE TYPE public.app_role AS ENUM ('admin', 'instructor', 'student');
CREATE TYPE public.app_permission AS ENUM (
  'courses.create',
  'courses.edit',
  'courses.delete',
  'users.manage',
  'content.moderate'
);

-- User roles table
CREATE TABLE public.user_roles (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Role permissions table
CREATE TABLE public.role_permissions (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  role app_role NOT NULL,
  permission app_permission NOT NULL,
  UNIQUE (role, permission)
);

-- Insert default permissions
INSERT INTO public.role_permissions (role, permission) VALUES
  ('admin', 'courses.create'),
  ('admin', 'courses.edit'),
  ('admin', 'courses.delete'),
  ('admin', 'users.manage'),
  ('admin', 'content.moderate'),
  ('instructor', 'courses.create'),
  ('instructor', 'courses.edit'),
  ('instructor', 'content.moderate');
```

#### 2. Create Auth Hook for Custom Claims

```sql
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims jsonb;
  user_role public.app_role;
BEGIN
  -- Fetch the user role
  SELECT role INTO user_role 
  FROM public.user_roles 
  WHERE user_id = (event->>'user_id')::uuid;

  claims := event->'claims';

  IF user_role IS NOT NULL THEN
    -- Set the claim
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  ELSE
    -- Default to 'student' if no role assigned
    claims := jsonb_set(claims, '{user_role}', '"student"');
  END IF;

  -- Update the 'claims' object in the original event
  event := jsonb_set(event, '{claims}', claims);

  RETURN event;
END;
$$;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
GRANT ALL ON TABLE public.user_roles TO supabase_auth_admin;
```

#### 3. Enable Auth Hook in Supabase Dashboard

1. Go to **Authentication > Hooks (Beta)**
2. Select **Custom Access Token** hook
3. Choose `public.custom_access_token_hook` function

#### 4. Access Custom Claims in Application

**In Client Components:**

```typescript
import { jwtDecode } from 'jwt-decode'
import { useAuth } from '@/contexts/auth-context'

function UserRoleDisplay() {
  const { user } = useAuth()
  const supabase = createClient()
  
  const [userRole, setUserRole] = useState<string>()

  useEffect(() => {
    const getRole = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const jwt = jwtDecode(session.access_token)
        setUserRole(jwt.user_role)
      }
    }
    getRole()
  }, [user])

  return <div>Role: {userRole}</div>
}
```

**In Server Components:**

```typescript
import { createClient } from '@/lib/supabase/server'
import { jwtDecode } from 'jwt-decode'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    const jwt = jwtDecode(session.access_token)
    const userRole = jwt.user_role
    
    if (userRole !== 'admin') {
      redirect('/unauthorized')
    }
  }
  
  return <div>Admin Dashboard</div>
}
```

#### 5. RLS Policies with Custom Claims

```sql
-- Create authorize function
CREATE OR REPLACE FUNCTION public.authorize(
  requested_permission app_permission
)
RETURNS BOOLEAN AS $$
DECLARE
  bind_permissions INT;
  user_role public.app_role;
BEGIN
  -- Fetch user role from JWT
  SELECT (auth.jwt()->>'user_role')::public.app_role INTO user_role;
  
  SELECT COUNT(*)
  INTO bind_permissions
  FROM public.role_permissions
  WHERE role_permissions.permission = requested_permission
    AND role_permissions.role = user_role;
  
  RETURN bind_permissions > 0;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '';

-- Example RLS policy for courses table
CREATE POLICY "Allow authorized course deletion"
  ON public.courses
  FOR DELETE
  TO authenticated
  USING (
    (SELECT authorize('courses.delete'))
  );
```

---

## 📋 AUTHENTICATION PATTERNS

### Pattern 1: Fetch User Once, Pass Down

**✅ BEST PRACTICE:**

```typescript
// app/(protected)/dashboard/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // Fetch user ONCE at layout level
  const { data: { user }, error } = await supabase.auth.getClaims()
  
  if (error || !user) {
    redirect('/login')
  }

  // Pass user to all child pages/components
  return (
    <div>
      <DashboardNav user={user} />
      <main>
        {children}
      </main>
    </div>
  )
}
```

### Pattern 2: Protect API Routes

```typescript
// app/api/courses/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  // Validate user with getClaims()
  const { data: { user }, error } = await supabase.auth.getClaims()
  
  if (error || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Check user role from JWT
  const session = await supabase.auth.getSession()
  if (session.data.session) {
    const jwt = jwtDecode(session.data.session.access_token)
    if (jwt.user_role !== 'admin' && jwt.user_role !== 'instructor') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }
  }

  // Process the request
  const body = await request.json()
  
  // Your business logic here
  
  return NextResponse.json({ success: true })
}
```

### Pattern 3: Server Actions

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteCourse(courseId: string) {
  const supabase = await createClient()
  
  // Validate user
  const { data: { user }, error } = await supabase.auth.getClaims()
  
  if (error || !user) {
    throw new Error('Unauthorized')
  }

  // Delete course (RLS will check permissions)
  const { error: deleteError } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId)

  if (deleteError) {
    throw new Error(deleteError.message)
  }

  revalidatePath('/dashboard/courses')
}
```

---

## 🔄 MIGRATION CHECKLIST

- [ ] **Install packages:** `@supabase/supabase-js` and `@supabase/ssr`
- [ ] **Create client utilities:** `lib/supabase/client.ts` and `lib/supabase/server.ts`
- [ ] **Create middleware utilities:** `lib/supabase/middleware.ts`
- [ ] **Create middleware:** `middleware.ts` with proper matcher
- [ ] **Replace AuthContext:** Rewrite to use Supabase Auth SDK
- [ ] **Create OAuth callback route:** `app/auth/callback/route.ts`
- [ ] **Update login form:** Use `signInWithPassword` and `signInWithOAuth`
- [ ] **Update register form:** Use `signUp` with metadata
- [ ] **Protect server components:** Use `getClaims()` instead of `getSession()`
- [ ] **Create user roles table:** SQL schema for RBAC
- [ ] **Create Auth Hook:** Custom access token hook for claims
- [ ] **Enable hook in dashboard:** Supabase Auth Hooks configuration
- [ ] **Implement RLS policies:** Row Level Security with custom claims
- [ ] **Test email/password auth:** Verify login flow
- [ ] **Test Google OAuth:** Verify OAuth callback and redirect
- [ ] **Test role-based access:** Verify RBAC policies work
- [ ] **Remove localStorage mock:** Delete old auth code

---

## 🎯 SUMMARY

**Current Implementation:** 🔴 NOT SECURE  
- Using localStorage mock
- No JWT validation
- Sessions can be spoofed
- No server-side authentication

**Required Implementation:** ✅ SECURE  
- Proper Supabase Auth SDK
- Cookie-based session management
- `getClaims()` for server-side validation
- JWT signature verification
- Custom claims for RBAC
- RLS policies for data access control

**Estimated Implementation Time:**
- Phase 1-2 (Setup): 1-2 hours
- Phase 3-4 (Basic Auth): 2-3 hours
- Phase 5-6 (Advanced/RBAC): 3-4 hours
- **Total:** 6-9 hours

**Priority:** 🔴 **CRITICAL - Must be done before production**

---

## 📚 OFFICIAL DOCUMENTATION

- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Custom Claims & RBAC](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)
- [Auth Hooks](https://supabase.com/docs/guides/auth/auth-hooks)
- [@supabase/ssr Package](https://www.npmjs.com/package/@supabase/ssr)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

---

**Document Version:** 1.0  
**Last Updated:** December 6, 2025  
**Reviewed By:** Senior Product Manager & Technical Architect
