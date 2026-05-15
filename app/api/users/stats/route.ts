import { NextRequest, NextResponse, connection } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { gte, lt, and, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

export async function GET(request: NextRequest) {
  await connection()

  try {
    // Verify authentication and authorization (admin or instructor only)
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult // Return 401/403 response
    }

    // Calculate date ranges
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Execute all queries in parallel for performance
    const [
      [{ total: totalUsersRaw }],
      [{ count: newUsersLastMonthRaw }],
      [{ count: newUsersLastWeekRaw }],
      [{ count: activeUsersRaw }],
      [{ count: previousMonthTotalRaw }],
      [{ count: previousWeekNewUsersRaw }],
    ] = await Promise.all([
      db.select({ total: sql<number>`count(*)::int` }).from(users),
      db.select({ count: sql<number>`count(*)::int` }).from(users).where(gte(users.createdAt, lastMonth)),
      db.select({ count: sql<number>`count(*)::int` }).from(users).where(gte(users.createdAt, lastWeek)),
      db.select({ count: sql<number>`count(*)::int` }).from(users).where(gte(users.lastLoginAt, lastMonth)),
      db.select({ count: sql<number>`count(*)::int` }).from(users).where(lt(users.createdAt, lastMonth)),
      db.select({ count: sql<number>`count(*)::int` }).from(users).where(and(gte(users.createdAt, new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)), lt(users.createdAt, lastWeek))),
    ])

    const totalUsers = Number(totalUsersRaw)
    const newUsersLastMonth = Number(newUsersLastMonthRaw)
    const newUsersLastWeek = Number(newUsersLastWeekRaw)
    const activeUsers = Number(activeUsersRaw)
    const previousMonthTotal = Number(previousMonthTotalRaw)
    const previousWeekNewUsers = Number(previousWeekNewUsersRaw)
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
