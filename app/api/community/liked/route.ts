import { NextRequest, NextResponse, connection } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

// GET - Get all post IDs that the current user has liked
export async function GET(request: NextRequest) {
  try {
    await connection()
    
    // Get current user from Supabase Auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({
        likedPostIds: [],
      })
    }

    const userId = user.id

    // Get all likes for this user
    const likes = await prisma.community_likes.findMany({
      where: { userId },
      select: { postId: true },
    })

    const likedPostIds = likes.map((like: { postId: string }) => like.postId)

    return NextResponse.json({
      likedPostIds,
    })
  } catch (error) {
    console.error('Get liked posts error:', error)
    return NextResponse.json(
      { error: 'Failed to get liked posts' },
      { status: 500 }
    )
  }
}
