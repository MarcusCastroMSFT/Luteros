import { NextRequest, NextResponse, connection } from 'next/server'
import { requireAdminOrInstructor } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    await connection()
    
    // Verify authentication and authorization (admin or instructor only)
    const authResult = await requireAdminOrInstructor(request)
    if (authResult instanceof NextResponse) {
      return authResult // Return 401/403 response
    }

    // Calculate date ranges
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate())

    // Execute all queries in parallel for performance
    const [
      totalProducts,
      activeProducts,
      inactiveProducts,
      featuredProducts,
      newProductsThisMonth,
      newProductsLastMonth,
      totalUsageCount,
      membersOnlyProducts,
      allAccessProducts,
      categoriesCount,
    ] = await Promise.all([
      // Total products count
      prisma.products.count(),
      
      // Active products count
      prisma.products.count({
        where: { isActive: true }
      }),
      
      // Inactive products count
      prisma.products.count({
        where: { isActive: false }
      }),
      
      // Featured products count
      prisma.products.count({
        where: { isFeatured: true, isActive: true }
      }),
      
      // New products this month
      prisma.products.count({
        where: {
          createdAt: { gte: lastMonth }
        }
      }),
      
      // New products last month (for comparison)
      prisma.products.count({
        where: {
          createdAt: {
            gte: twoMonthsAgo,
            lt: lastMonth
          }
        }
      }),
      
      // Total usage count
      prisma.products.aggregate({
        _sum: { usageCount: true }
      }),
      
      // Members only products
      prisma.products.count({
        where: { availability: 'members', isActive: true }
      }),
      
      // All access products
      prisma.products.count({
        where: { availability: 'all', isActive: true }
      }),
      
      // Unique categories count
      prisma.products.groupBy({
        by: ['category'],
        where: { isActive: true }
      }),
    ])

    // Calculate growth percentages
    const productsGrowth = newProductsLastMonth > 0
      ? ((newProductsThisMonth - newProductsLastMonth) / newProductsLastMonth * 100).toFixed(1)
      : newProductsThisMonth > 0 ? '100.0' : '0.0'
    
    const activeGrowth = newProductsLastMonth > 0
      ? ((activeProducts - (activeProducts - newProductsThisMonth)) / Math.max(activeProducts - newProductsThisMonth, 1) * 100).toFixed(1)
      : '0.0'

    return NextResponse.json({
      totalProducts,
      totalProductsGrowth: productsGrowth,
      newProductsThisMonth,
      activeProducts,
      activeProductsGrowth: activeGrowth,
      inactiveProducts,
      featuredProducts,
      totalUsageCount: totalUsageCount._sum.usageCount || 0,
      membersOnlyProducts,
      allAccessProducts,
      categoriesCount: categoriesCount.length,
    })

  } catch (error) {
    console.error('Error fetching product stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product statistics' },
      { status: 500 }
    )
  }
}
