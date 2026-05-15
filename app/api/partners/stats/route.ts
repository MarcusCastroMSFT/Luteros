import { NextRequest, NextResponse } from 'next/server';
import { connection } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { productPartners, products } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  // Signal that this route needs request data (auth uses cookies)
  await connection();
  
  try {
    // Verify authentication
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [[row], [{ totalProducts }]] = await Promise.all([
      db.select({
        totalPartners: sql<number>`count(*)::int`,
        activePartners: sql<number>`count(*) filter (where ${productPartners.isActive} = true)::int`,
        inactivePartners: sql<number>`count(*) filter (where ${productPartners.isActive} = false)::int`,
        newPartnersThisMonth: sql<number>`count(*) filter (where ${productPartners.createdAt} >= ${startOfMonth})::int`,
        partnersLastMonth: sql<number>`count(*) filter (where ${productPartners.createdAt} <= ${endOfLastMonth})::int`,
        activePartnersLastMonth: sql<number>`count(*) filter (where ${productPartners.isActive} = true AND ${productPartners.createdAt} <= ${endOfLastMonth})::int`,
      }).from(productPartners),
      db.select({ totalProducts: sql<number>`count(*)::int` }).from(products),
    ])

    const { totalPartners, activePartners, inactivePartners, newPartnersThisMonth,
      partnersLastMonth, activePartnersLastMonth } = row;

    // Calculate growth percentages
    const totalPartnersGrowth = partnersLastMonth > 0
      ? (((totalPartners - partnersLastMonth) / partnersLastMonth) * 100).toFixed(1)
      : totalPartners > 0 ? '100.0' : '0.0';

    const activePartnersGrowth = activePartnersLastMonth > 0
      ? (((activePartners - activePartnersLastMonth) / activePartnersLastMonth) * 100).toFixed(1)
      : activePartners > 0 ? '100.0' : '0.0';

    // Average products per partner
    const averageProductsPerPartner = activePartners > 0
      ? (totalProducts / activePartners).toFixed(1)
      : '0.0';

    return NextResponse.json({
      totalPartners,
      totalPartnersGrowth,
      newPartnersThisMonth,
      activePartners,
      activePartnersGrowth,
      inactivePartners,
      totalProducts,
      averageProductsPerPartner,
    });
  } catch (error) {
    console.error('Error fetching partner stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partner statistics' },
      { status: 500 }
    );
  }
}
