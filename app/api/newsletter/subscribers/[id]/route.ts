import { NextRequest, NextResponse, connection } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdminOrInstructor } from '@/lib/auth-helpers'

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connection()

    // Verify authentication and authorization (admin only)
    const authResult = await requireAdminOrInstructor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = await params

    // Validate UUID format
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: 'Invalid subscriber ID format' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status } = body

    // Validate status
    const validStatuses = ['ACTIVE', 'PENDING', 'UNSUBSCRIBED']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be ACTIVE, PENDING, or UNSUBSCRIBED' },
        { status: 400 }
      )
    }

    // Check if subscriber exists
    const subscriber = await prisma.newsletter_subscribers.findUnique({
      where: { id },
    })

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      )
    }

    // Update subscriber status
    const updateData: {
      status: 'ACTIVE' | 'PENDING' | 'UNSUBSCRIBED'
      confirmedAt?: Date | null
      unsubscribedAt?: Date | null
    } = {
      status,
    }

    // Set timestamps based on status change
    if (status === 'ACTIVE' && subscriber.status !== 'ACTIVE') {
      updateData.confirmedAt = new Date()
      updateData.unsubscribedAt = null
    } else if (status === 'UNSUBSCRIBED') {
      updateData.unsubscribedAt = new Date()
    }

    const updatedSubscriber = await prisma.newsletter_subscribers.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        status: true,
        confirmedAt: true,
        unsubscribedAt: true,
      },
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
  try {
    await connection()

    // Verify authentication and authorization (admin only)
    const authResult = await requireAdminOrInstructor(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = await params

    // Validate UUID format
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: 'Invalid subscriber ID format' },
        { status: 400 }
      )
    }

    // Check if subscriber exists
    const subscriber = await prisma.newsletter_subscribers.findUnique({
      where: { id },
    })

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      )
    }

    // Delete subscriber
    await prisma.newsletter_subscribers.delete({
      where: { id },
    })

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
