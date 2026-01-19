import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    // Verify the requesting user is authenticated (with caching)
    const user = await requireAuth(request)
    if (user instanceof NextResponse) {
      return user // Return 401 response
    }

    // Only allow users to fetch their own profile
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Fetch profile from Prisma
    const profile = await prisma.userProfile.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        displayName: true,
        avatar: true,
        bio: true,
        title: true,
        company: true,
        website: true,
        linkedin: true,
        twitter: true,
        language: true,
        timezone: true,
        lastLoginAt: true,
      },
    })

    // Get user role from UserRoleAssignment table
    const roleAssignment = await prisma.userRoleAssignment.findFirst({
      where: { userId },
      select: { role: true },
      orderBy: { createdAt: 'desc' }
    })
    const role = roleAssignment?.role || 'STUDENT'

    if (!profile) {
      // Profile doesn't exist yet, create it
      const newProfile = await prisma.userProfile.create({
        data: {
          id: userId,
          fullName: user.user_metadata?.full_name || user.user_metadata?.name,
          displayName: user.user_metadata?.display_name,
          avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          lastLoginAt: new Date(),
        },
      })

      return NextResponse.json({
        ...newProfile,
        email: user.email,
        role,
      })
    }

    return NextResponse.json({
      ...profile,
      email: user.email,
      role,
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    // Verify the requesting user is authenticated (with caching)
    const user = await requireAuth(request)
    if (user instanceof NextResponse) {
      return user // Return 401 response
    }

    // Only allow users to update their own profile
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Update profile in Prisma
    const updatedProfile = await prisma.userProfile.update({
      where: { id: userId },
      data: {
        fullName: body.fullName,
        displayName: body.displayName,
        bio: body.bio,
        title: body.title,
        company: body.company,
        website: body.website,
        linkedin: body.linkedin,
        twitter: body.twitter,
        avatar: body.avatar,
        language: body.language,
        timezone: body.timezone,
        emailNotifications: body.emailNotifications,
        marketingEmails: body.marketingEmails,
      },
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
