import { NextRequest, NextResponse } from 'next/server';
import { connection } from 'next/server';
import prisma from '@/lib/prisma';
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
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get all counts in parallel
    const [
      totalPartners,
      activePartners,
      inactivePartners,
      newPartnersThisMonth,
      partnersLastMonth,
      activePartnersLastMonth,
      totalProducts,
    ] = await Promise.all([
      // Total partners
      prisma.product_partners.count(),
      // Active partners
      prisma.product_partners.count({ where: { isActive: true } }),
      // Inactive partners
      prisma.product_partners.count({ where: { isActive: false } }),
      // New partners this month
      prisma.product_partners.count({
        where: {
          createdAt: { gte: startOfMonth }
        }
      }),
      // Partners at end of last month (for growth calculation)
      prisma.product_partners.count({
        where: {
          createdAt: { lte: endOfLastMonth }
        }
      }),
      // Active partners at end of last month
      prisma.product_partners.count({
        where: {
          isActive: true,
          createdAt: { lte: endOfLastMonth }
        }
      }),
      // Total products count
      prisma.products.count(),
    ]);

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
