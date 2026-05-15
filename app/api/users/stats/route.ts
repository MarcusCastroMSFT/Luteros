import { NextRequest, NextResponse, connection } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

export async function GET(request: NextRequest) {
  await connection()

  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const [stats] = await db
      .select({
        totalUsers: sql<number>`count(*)::int`,
        newUsersLastMonth: sql<number>`count(*) filter (where ${users.createdAt} >= ${lastMonth})::int`,
        newUsersLastWeek: sql<number>`count(*) filter (where ${users.createdAt} >= ${lastWeek})::int`,
        activeUsers: sql<number>`count(*) filter (where ${users.lastLoginAt} >= ${lastMonth})::int`,
        previousMonthTotal: sql<number>`count(*) filter (where ${users.createdAt} < ${lastMonth})::int`,
        previousWeekNewUsers: sql<number>`count(*) filter (where ${users.createdAt} >= ${twoWeeksAgo} and ${users.createdAt} < ${lastWeek})::int`,
      })
      .from(users)

    const totalUsers = Number(stats.totalUsers)
    const newUsersLastMonth = Number(stats.newUsersLastMonth)
    const newUsersLastWeek = Number(stats.newUsersLastWeek)
    const activeUsers = Number(stats.activeUsers)
    const previousMonthTotal = Number(stats.previousMonthTotal)
    const previousWeekNewUsers = Number(stats.previousWeekNewUsers)
    const premiumUsers = 0

    // Calculate growth percentages
    const totalUsersGrowth = previousMonthTotal > 0 
      ? Math.round((newUsersLastMonth / previousMonthTotal) * 100)
      : 0
    
    const newUsersGrowth = previousWeekNewUsers > 0
      ? Math.round(((newUsersLastWeek - previousWeekNewUsers) / previousWeekNewUsers) * 100)
      : 0

    // Calculate percentages
    const activeUsersPercentage = totalUsers > 0 
      ? ((activeUsers / totalUsers) * 100).toFixed(1)
      : '0.0'
    
    const premiumUsersPercentage = totalUsers > 0
      ? ((premiumUsers / totalUsers) * 100).toFixed(1)
      : '0.0'

    return NextResponse.json({
      totalUsers,
      totalUsersGrowth: `${totalUsersGrowth > 0 ? '+' : ''}${totalUsersGrowth}%`,
      totalUsersGrowthPositive: totalUsersGrowth >= 0,
      newUsers: newUsersLastWeek,
      newUsersGrowth: `${newUsersGrowth > 0 ? '+' : ''}${newUsersGrowth}%`,
      newUsersGrowthPositive: newUsersGrowth >= 0,
      activeUsers,
      activeUsersPercentage: `${activeUsersPercentage}%`,
      premiumUsers,
      premiumUsersPercentage: `${premiumUsersPercentage}%`,
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    )
  }
}
