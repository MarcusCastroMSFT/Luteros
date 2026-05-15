import { NextRequest, NextResponse, connection } from 'next/server'
import { db } from '@/lib/db'
import { newsletterSubscribers } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/auth-helpers'
import { eq } from 'drizzle-orm'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connection()

  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = await params

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: 'Invalid subscriber ID format' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status } = body

    const validStatuses = ['ACTIVE', 'PENDING', 'UNSUBSCRIBED']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be ACTIVE, PENDING, or UNSUBSCRIBED' },
        { status: 400 }
      )
    }

    const subscriber = await db
      .select({ id: newsletterSubscribers.id, status: newsletterSubscribers.status })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.id, id))
      .limit(1)
      .then((r) => r[0] ?? null)

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      )
    }

    const updateData: {
      status: 'ACTIVE' | 'PENDING' | 'UNSUBSCRIBED'
      confirmedAt?: Date | null
      unsubscribedAt?: Date | null
      updatedAt: Date
    } = {
      status,
      updatedAt: new Date(),
    }

    if (status === 'ACTIVE' && subscriber.status !== 'ACTIVE') {
      updateData.confirmedAt = new Date()
      updateData.unsubscribedAt = null
    } else if (status === 'UNSUBSCRIBED') {
      updateData.unsubscribedAt = new Date()
    }

    const [updatedSubscriber] = await db
      .update(newsletterSubscribers)
      .set(updateData)
      .where(eq(newsletterSubscribers.id, id))
      .returning({
        id: newsletterSubscribers.id,
        email: newsletterSubscribers.email,
        status: newsletterSubscribers.status,
        confirmedAt: newsletterSubscribers.confirmedAt,
        unsubscribedAt: newsletterSubscribers.unsubscribedAt,
      })

    return NextResponse.json({
      success: true,
      subscriber: updatedSubscriber,
    })
  } catch (error) {
    console.error('Error updating subscriber:', error)
    return NextResponse.json(
      { error: 'Failed to update subscriber' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connection()

  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = await params

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: 'Invalid subscriber ID format' },
        { status: 400 }
      )
    }

    const subscriber = await db
      .select({ id: newsletterSubscribers.id })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.id, id))
      .limit(1)
      .then((r) => r[0] ?? null)

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      )
    }

    await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, id))

    return NextResponse.json({
      success: true,
      message: 'Subscriber deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting subscriber:', error)
    return NextResponse.json(
      { error: 'Failed to delete subscriber' },
      { status: 500 }
    )
  }
}
