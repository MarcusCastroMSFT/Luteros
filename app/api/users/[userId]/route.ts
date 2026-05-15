import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) return authResult

    const { userId } = await context.params

    const user = await db
      .select({
        id: users.id, name: users.name, email: users.email, emailVerified: users.emailVerified,
        image: users.image, role: users.role, displayName: users.displayName, bio: users.bio,
        phone: users.phone, dateOfBirth: users.dateOfBirth, title: users.title, company: users.company,
        website: users.website, linkedin: users.linkedin, twitter: users.twitter, instagram: users.instagram,
        rating: users.rating, reviewsCount: users.reviewsCount, studentsCount: users.studentsCount,
        coursesCount: users.coursesCount, language: users.language, timezone: users.timezone,
        emailNotifications: users.emailNotifications, marketingEmails: users.marketingEmails,
        lastLoginAt: users.lastLoginAt, createdAt: users.createdAt, updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then((r) => r[0] ?? null)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...user,
      rating: user.rating ? Number(user.rating) : null,
      status: user.lastLoginAt ? 'Ativo' : 'Inativo',
    })
  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) return authResult

    const { userId } = await context.params
    const body = await request.json()

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then((r) => r[0] ?? null)

    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updateData: Partial<typeof users.$inferInsert> = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.fullName !== undefined) updateData.name = body.fullName
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
    if (body.role !== undefined) updateData.role = body.role
    updateData.updatedAt = new Date()

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning()

    const { password: _pw, ...safeUser } = updated
    return NextResponse.json(safeUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) return authResult
    const { user: authUser } = authResult

    const { userId } = await context.params

    if (authUser.id === userId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then((r) => r[0] ?? null)

    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await db.delete(users).where(eq(users.id, userId))

    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
