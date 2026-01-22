import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
    const whereClause: Record<string, unknown> = {
      isActive: true,
    };

    // Add search filter if provided
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { partner: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Add category filter if provided
    if (category && category !== 'all') {
      whereClause.category = category;
    }

    // Add availability filter if provided
    if (availability && availability !== 'all') {
      whereClause.availability = availability;
    }

    // Add featured filter if provided
    if (featured === 'true') {
      whereClause.isFeatured = true;
    }

    // Get total count, paginated products, and categories in parallel
    const [totalProducts, products, categoriesRaw] = await Promise.all([
      prisma.products.count({ where: whereClause }),
      prisma.products.findMany({
        where: whereClause,
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          shortDescription: true,
          image: true,
          discountPercentage: true,
          discountType: true,
          originalPrice: true,
          discountedPrice: true,
          discountAmount: true,
          promoCode: true,
          category: true,
          tags: true,
          availability: true,
          validUntil: true,
          termsAndConditions: true,
          howToUse: true,
          features: true,
          isActive: true,
          isFeatured: true,
          usageCount: true,
          maxUsages: true,
          createdAt: true,
          partner: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              website: true,
            },
          },
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      // Get distinct categories with counts
      prisma.products.groupBy({
        by: ['category'],
        where: { isActive: true },
        _count: { category: true },
        orderBy: { category: 'asc' },
      }),
    ]);

    // Transform products to match frontend interface
    const transformedProducts = products.map((product: typeof products[number]) => ({
      id: product.id,
      slug: product.slug,
      title: product.title,
      description: product.description,
      shortDescription: product.shortDescription,
      image: product.image || '',
      partner: {
        id: product.product_partners.id,
        name: product.product_partners.name,
        logo: product.product_partners.logo || '',
        website: product.product_partners.website || '',
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
    const categories = categoriesRaw.map((cat: typeof categoriesRaw[number], index: number) => ({
      id: `cat-${index + 1}`,
      name: cat.category,
      slug: cat.category.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      count: cat._count.category,
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
