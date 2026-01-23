import { NextRequest, NextResponse, connection } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    await connection()

    // Verify authentication and authorization (admin only)
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // Get current date info for calculations
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - 7)

    // Total subscribers (all time)
    const totalSubscribers = await prisma.newsletter_subscribers.count()

    // Total active subscribers
    const activeSubscribers = await prisma.newsletter_subscribers.count({
      where: { status: 'ACTIVE' },
    })

    // New subscribers this month
    const newThisMonth = await prisma.newsletter_subscribers.count({
      where: {
        createdAt: { gte: startOfMonth },
      },
    })

    // New subscribers last month (for comparison)
    const newLastMonth = await prisma.newsletter_subscribers.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lt: startOfMonth,
        },
      },
    })

    // New subscribers this week
    const newThisWeek = await prisma.newsletter_subscribers.count({
      where: {
        createdAt: { gte: startOfWeek },
      },
    })

    // Unsubscribed this month
    const unsubscribedThisMonth = await prisma.newsletter_subscribers.count({
      where: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: { gte: startOfMonth },
      },
    })

    // Pending confirmations
    const pendingConfirmations = await prisma.newsletter_subscribers.count({
      where: { status: 'PENDING' },
    })

    // Calculate growth percentage
    const monthlyGrowth = newLastMonth > 0 
      ? ((newThisMonth - newLastMonth) / newLastMonth * 100).toFixed(1)
      : newThisMonth > 0 ? '100.0' : '0.0'

    // Calculate active rate
    const activeRate = totalSubscribers > 0 
      ? ((activeSubscribers / totalSubscribers) * 100).toFixed(1)
      : '0.0'

    // Calculate churn rate (unsubscribed / active at start of month)
    const churnRate = activeSubscribers > 0 
      ? ((unsubscribedThisMonth / (activeSubscribers + unsubscribedThisMonth)) * 100).toFixed(2)
      : '0.00'

    return NextResponse.json({
      totalSubscribers,
      activeSubscribers,
      newThisMonth,
      newThisWeek,
      pendingConfirmations,
      unsubscribedThisMonth,
      monthlyGrowth: `${parseFloat(monthlyGrowth) >= 0 ? '+' : ''}${monthlyGrowth}%`,
      monthlyGrowthPositive: parseFloat(monthlyGrowth) >= 0,
      activeRate: `${activeRate}%`,
      churnRate: `${churnRate}%`,
    })
  } catch (error) {
    console.error('Error fetching newsletter stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch newsletter statistics' },
      { status: 500 }
    )
  }
}
