import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify authentication (with caching)
    const authUser = await requireAuth(request)
    if (authUser instanceof NextResponse) {
      return authUser // Return 401 response
    }

    // In Next.js 15, params is a Promise
    const params = await context.params
    const userId = params.userId

    // Execute both queries in parallel for better performance
    const supabaseAdmin = createAdminClient()
    
    const [userProfile, authData] = await Promise.all([
      // Fetch user profile from database
      prisma.userProfile.findUnique({
        where: { id: userId },
        select: {
          id: true,
          fullName: true,
          displayName: true,
          bio: true,
          avatar: true,
          phone: true,
          dateOfBirth: true,
          title: true,
          company: true,
          website: true,
          linkedin: true,
          twitter: true,
          instagram: true,
          rating: true,
          reviewsCount: true,
          studentsCount: true,
          coursesCount: true,
          language: true,
          timezone: true,
          emailNotifications: true,
          marketingEmails: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        }
      }),
      // Get email from Supabase Auth using Admin API
      supabaseAdmin.auth.admin.getUserById(userId)
        .then(result => result.data)
        .catch(() => null)
    ])

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const email = authData?.user?.email || 'N/A'

    // Determine status based on lastLoginAt
    const status = userProfile.lastLoginAt ? 'Ativo' : 'Inativo'
    
    // Get actual role from UserRoleAssignment table
    const roleAssignment = await prisma.userRoleAssignment.findFirst({
      where: { userId },
      select: { role: true },
      orderBy: { createdAt: 'desc' }
    })
    
    const role = roleAssignment?.role || 'STUDENT'

    return NextResponse.json({
      ...userProfile,
      email,
      status,
      role,
      rating: userProfile.rating ? Number(userProfile.rating) : null,
    })
  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify authentication (with caching)
    const authUser = await requireAuth(request)
    if (authUser instanceof NextResponse) {
      return authUser // Return 401 response
    }

    // In Next.js 15, params is a Promise
    const params = await context.params
    const userId = params.userId

    // Parse request body
    const body = await request.json()
    
    // Validate that the user exists
    const existingUser = await prisma.userProfile.findUnique({
      where: { id: userId },
      select: { id: true }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prepare update data - only include fields that are provided
    const updateData: any = {}
    
    if (body.fullName !== undefined) updateData.fullName = body.fullName
    if (body.displayName !== undefined) updateData.displayName = body.displayName
    if (body.bio !== undefined) updateData.bio = body.bio
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.dateOfBirth !== undefined) updateData.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null
    if (body.title !== undefined) updateData.title = body.title
    if (body.company !== undefined) updateData.company = body.company
    if (body.website !== undefined) updateData.website = body.website
    if (body.linkedin !== undefined) updateData.linkedin = body.linkedin
    if (body.twitter !== undefined) updateData.twitter = body.twitter
    if (body.instagram !== undefined) updateData.instagram = body.instagram
    if (body.emailNotifications !== undefined) updateData.emailNotifications = body.emailNotifications
    if (body.marketingEmails !== undefined) updateData.marketingEmails = body.marketingEmails

    // Handle role update separately in UserRoleAssignment table
    if (body.role !== undefined) {
      // Check if role assignment exists
      const existingRole = await prisma.userRoleAssignment.findFirst({
        where: { userId }
      })

      if (existingRole) {
        // Update existing role
        await prisma.userRoleAssignment.update({
          where: { id: existingRole.id },
          data: { role: body.role }
        })
      } else {
        // Create new role assignment
        await prisma.userRoleAssignment.create({
          data: {
            userId,
            role: body.role
          }
        })
      }
    }

    // Update user profile
    const updatedUser = await prisma.userProfile.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        displayName: true,
        bio: true,
        avatar: true,
        phone: true,
        dateOfBirth: true,
        title: true,
        company: true,
        website: true,
        linkedin: true,
        twitter: true,
        instagram: true,
        emailNotifications: true,
        marketingEmails: true,
        updatedAt: true,
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify authentication (with caching)
    const authUser = await requireAuth(request)
    if (authUser instanceof NextResponse) {
      return authUser // Return 401 response
    }

    // In Next.js 15, params is a Promise
    const params = await context.params
    const userId = params.userId

    // Prevent users from deleting themselves
    if (authUser.id === userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Validate that the user exists
    const existingUser = await prisma.userProfile.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete user profile (cascade will handle related records based on schema)
    await prisma.userProfile.delete({
      where: { id: userId }
    })

    // Optionally delete from Supabase Auth as well
    const supabaseAdmin = createAdminClient()
    try {
      await supabaseAdmin.auth.admin.deleteUser(userId)
    } catch (authError) {
      console.error('Error deleting user from Supabase Auth:', authError)
      // Continue even if auth deletion fails - user profile is already deleted
    }

    return NextResponse.json({ 
      success: true,
      message: 'User deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
