import { NextRequest, NextResponse, connection } from 'next/server'
import { getPostById, updatePost, deletePost } from '@/lib/community'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    await connection()
    
    const { postId } = await params
    
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    const post = await getPostById(postId)

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: post })
  } catch (error) {
    console.error('Community post API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch community post' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    await connection()
    
    const { postId } = await params
    
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const updatedPost = await updatePost(postId, body, user.id)

    if (!updatedPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: updatedPost })
  } catch (error) {
    console.error('Community post update error:', error)
    return NextResponse.json(
      { error: 'Failed to update community post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    await connection()
    
    const { postId } = await params
    
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const deleted = await deletePost(postId, user.id)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Post not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Community post delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete community post' },
      { status: 500 }
    )
  }
}
