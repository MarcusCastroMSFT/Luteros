import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrInstructor } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and authorization (admin or instructor only)
    const authResult = await requireAdminOrInstructor(request)
    if (authResult instanceof NextResponse) {
      return authResult // Return 401/403 response
    }

    // Calculate date ranges
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Execute all queries in parallel for performance
    const [
      totalUsers,
      newUsersLastMonth,
      newUsersLastWeek,
      activeUsers,
      previousMonthTotal,
      previousWeekNewUsers,
    ] = await Promise.all([
      // Total users
      prisma.userProfile.count(),
      
      // New users in last month
      prisma.userProfile.count({
        where: {
          createdAt: {
            gte: lastMonth
          }
        }
      }),
      
      // New users in last week
      prisma.userProfile.count({
        where: {
          createdAt: {
            gte: lastWeek
          }
        }
      }),
      
      // Active users (logged in within last 30 days)
      prisma.userProfile.count({
        where: {
          lastLoginAt: {
            gte: lastMonth
          }
        }
      }),
      
      // Previous month total for trend calculation
      prisma.userProfile.count({
        where: {
          createdAt: {
            lt: lastMonth
          }
        }
      }),
      
      // Previous week new users for trend calculation
      prisma.userProfile.count({
        where: {
          createdAt: {
            gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
            lt: lastWeek
          }
        }
      })
    ])
    
    // TODO: Add premium users count once Subscription model is implemented
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
