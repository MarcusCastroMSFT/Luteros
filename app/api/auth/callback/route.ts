import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Create user profile in Prisma if it doesn't exist
        try {
          const prisma = (await import('@/lib/prisma')).default
          
          await prisma.userProfile.upsert({
            where: { id: user.id },
            update: {
              lastLoginAt: new Date(),
            },
            create: {
              id: user.id,
              fullName: user.user_metadata?.full_name || user.user_metadata?.name,
              displayName: user.user_metadata?.display_name,
              avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
              lastLoginAt: new Date(),
            },
          })
        } catch (error) {
          console.error('Error creating user profile:', error)
        }
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/auth/error`)
}
