import { NextRequest, NextResponse } from 'next/server';
import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { products, productPartners } from '@/lib/db/schema';

export async function GET(request: NextRequest) {
  // Add cache tag for manual invalidation
  const headers = new Headers({
    'Cache-Tag': 'products-public',
  });
  
  const { searchParams } = new URL(request.url);
  
  // Extract query parameters
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '9');
  const search = searchParams.get('search');
  const category = searchParams.get('category');
  const availability = searchParams.get('availability');
  const featured = searchParams.get('featured');

  try {
    // Build where clause for active products only
    const whereParts = [
      eq(products.isActive, true),
      search ? or(ilike(products.title, `%${search}%`), ilike(products.shortDescription, `%${search}%`), ilike(products.category, `%${search}%`), ilike(productPartners.name, `%${search}%`)) : undefined,
      category && category !== 'all' ? eq(products.category, category) : undefined,
      availability && availability !== 'all' ? eq(products.availability, availability) : undefined,
      featured === 'true' ? eq(products.isFeatured, true) : undefined,
    ] as const
    const publicWhere = and(...whereParts)

    const productCols = {
      id: products.id, slug: products.slug, title: products.title, description: products.description,
      shortDescription: products.shortDescription, image: products.image,
      discountPercentage: products.discountPercentage, discountType: products.discountType,
      originalPrice: products.originalPrice, discountedPrice: products.discountedPrice,
      discountAmount: products.discountAmount, promoCode: products.promoCode,
      category: products.category, tags: products.tags, availability: products.availability,
      validUntil: products.validUntil, termsAndConditions: products.termsAndConditions,
      howToUse: products.howToUse, features: products.features,
      isActive: products.isActive, isFeatured: products.isFeatured,
      usageCount: products.usageCount, maxUsages: products.maxUsages, createdAt: products.createdAt,
      partnerId: productPartners.id, partnerName: productPartners.name,
      partnerSlug: productPartners.slug, partnerLogo: productPartners.logo, partnerWebsite: productPartners.website,
    }

    // Get total count, paginated products, and categories in parallel
    const [[{ totalProducts }], productsRows, categoriesRaw] = await Promise.all([
      db.select({ totalProducts: sql<number>`count(*)::int` }).from(products)
        .innerJoin(productPartners, eq(products.partnerId, productPartners.id)).where(publicWhere),
      db.select(productCols).from(products)
        .innerJoin(productPartners, eq(products.partnerId, productPartners.id)).where(publicWhere)
        .orderBy(desc(products.isFeatured), desc(products.createdAt)).offset((page - 1) * limit).limit(limit),
      db.select({ category: products.category, count: sql<number>`count(*)::int` }).from(products)
        .where(eq(products.isActive, true)).groupBy(products.category).orderBy(asc(products.category)),
    ]);

    // Transform products to match frontend interface
    const transformedProducts = productsRows.map((product) => ({
      id: product.id,
      slug: product.slug,
      title: product.title,
      description: product.description,
      shortDescription: product.shortDescription,
      image: product.image || '',
      partner: {
        id: product.partnerId,
        name: product.partnerName,
        logo: product.partnerLogo || '',
        website: product.partnerWebsite || '',
      },
      discount: {
        percentage: product.discountPercentage,
        amount: product.discountAmount ? Number(product.discountAmount) : undefined,
        type: product.discountType as 'percentage' | 'fixed',
        originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
        discountedPrice: product.discountedPrice ? Number(product.discountedPrice) : undefined,
      },
      promoCode: product.promoCode,
      category: product.category,
      tags: product.tags,
      availability: product.availability as 'all' | 'members',
      validUntil: product.validUntil?.toISOString().split('T')[0] || '',
      termsAndConditions: product.termsAndConditions || '',
      howToUse: product.howToUse,
      features: product.features,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      createdDate: product.createdAt.toISOString().split('T')[0],
      usageCount: product.usageCount,
      maxUsages: product.maxUsages || undefined,
    }));

    // Transform categories
    const categories = categoriesRaw.map((cat, index: number) => ({
      id: `cat-${index + 1}`,
      name: cat.category,
      slug: cat.category.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      count: cat.count,
    }));

    // Calculate pagination
    const totalPages = Math.ceil(totalProducts / limit);

    return NextResponse.json({
      success: true,
      data: transformedProducts,
      pagination: {
        page,
        limit,
        totalItems: totalProducts,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      categories,
    }, { headers });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products',
        data: [],
        pagination: {
          page: 1,
          limit: 9,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        categories: [],
      },
      { status: 500 }
    );
  }
}
