import { NextRequest, NextResponse, connection } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'

export async function GET(request: NextRequest) {
  try {
    await connection()
    
    // Verify authentication and authorization (admin or instructor only)
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult // Return 401/403 response
    }

    // Calculate date ranges
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate())

    const [[row], categoriesRaw] = await Promise.all([
      db.select({
        totalProducts: sql<number>`count(*)::int`,
        activeProducts: sql<number>`count(*) filter (where ${products.isActive} = true)::int`,
        inactiveProducts: sql<number>`count(*) filter (where ${products.isActive} = false)::int`,
        featuredProducts: sql<number>`count(*) filter (where ${products.isFeatured} = true AND ${products.isActive} = true)::int`,
        newProductsThisMonth: sql<number>`count(*) filter (where ${products.createdAt} >= ${lastMonth})::int`,
        newProductsLastMonth: sql<number>`count(*) filter (where ${products.createdAt} >= ${twoMonthsAgo} AND ${products.createdAt} < ${lastMonth})::int`,
        totalUsageCount: sql<number>`coalesce(sum(${products.usageCount}), 0)::int`,
        membersOnlyProducts: sql<number>`count(*) filter (where ${products.availability} = 'members' AND ${products.isActive} = true)::int`,
        allAccessProducts: sql<number>`count(*) filter (where ${products.availability} = 'all' AND ${products.isActive} = true)::int`,
      }).from(products),
      db.selectDistinct({ category: products.category }).from(products).where(eq(products.isActive, true)),
    ])

    const { totalProducts, activeProducts, inactiveProducts, featuredProducts,
      newProductsThisMonth, newProductsLastMonth, totalUsageCount, membersOnlyProducts, allAccessProducts } = row

    const categoriesCount = categoriesRaw.length

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
      totalUsageCount,
      membersOnlyProducts,
      allAccessProducts,
      categoriesCount: categoriesCount,
    })

  } catch (error) {
    console.error('Error fetching product stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product statistics' },
      { status: 500 }
    )
  }
}
