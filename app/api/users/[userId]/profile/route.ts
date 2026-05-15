import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    const authUser = await requireAuth(request)
    if (authUser instanceof NextResponse) return authUser

    if (authUser.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const profile = await db
      .select({
        id: users.id,
        name: users.name,
        displayName: users.displayName,
        image: users.image,
        bio: users.bio,
        title: users.title,
        company: users.company,
        website: users.website,
        linkedin: users.linkedin,
        twitter: users.twitter,
        language: users.language,
        timezone: users.timezone,
        lastLoginAt: users.lastLoginAt,
        role: users.role,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then((r) => r[0] ?? null)

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...profile,
      fullName: profile.name,
      avatar: profile.image,
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    const authUser = await requireAuth(request)
    if (authUser instanceof NextResponse) return authUser

    if (authUser.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    const updateData: Partial<typeof users.$inferInsert> = { updatedAt: new Date() }
    if (body.fullName !== undefined) updateData.name = body.fullName
    if (body.name !== undefined) updateData.name = body.name
    if (body.displayName !== undefined) updateData.displayName = body.displayName
    if (body.bio !== undefined) updateData.bio = body.bio
    if (body.title !== undefined) updateData.title = body.title
    if (body.company !== undefined) updateData.company = body.company
    if (body.website !== undefined) updateData.website = body.website
    if (body.linkedin !== undefined) updateData.linkedin = body.linkedin
    if (body.twitter !== undefined) updateData.twitter = body.twitter
    if (body.avatar !== undefined) updateData.image = body.avatar
    if (body.image !== undefined) updateData.image = body.image
    if (body.language !== undefined) updateData.language = body.language
    if (body.timezone !== undefined) updateData.timezone = body.timezone
    if (body.emailNotifications !== undefined) updateData.emailNotifications = body.emailNotifications
    if (body.marketingEmails !== undefined) updateData.marketingEmails = body.marketingEmails

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning()

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
