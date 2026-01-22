import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  // Add cache tag for manual invalidation
  const headers = new Headers({
    'Cache-Tag': 'products-public',
  });

  try {
    const { slug } = await params;

    // Find the product by slug
    const product = await prisma.products.findUnique({
      where: {
        slug,
        isActive: true,
      },
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
        product_partners: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            website: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
          data: null,
        },
        { status: 404, headers }
      );
    }

    // Get related products (same category, excluding current product)
    const relatedProducts = await prisma.products.findMany({
      where: {
        isActive: true,
        category: product.category,
        id: { not: product.id },
      },
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
        product_partners: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            website: true,
          },
        },
      },
      orderBy: {
        isFeatured: 'desc',
      },
      take: 3,
    });

    // Transform product to match frontend interface
    const transformProduct = (p: typeof product) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      shortDescription: p.shortDescription,
      image: p.image || '',
      partner: {
        id: p.product_partners.id,
        name: p.product_partners.name,
        logo: p.product_partners.logo || '',
        website: p.product_partners.website || '',
      },
      discount: {
        percentage: p.discountPercentage,
        amount: p.discountAmount ? Number(p.discountAmount) : undefined,
        type: p.discountType as 'percentage' | 'fixed',
        originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
        discountedPrice: p.discountedPrice ? Number(p.discountedPrice) : undefined,
      },
      promoCode: p.promoCode,
      category: p.category,
      tags: p.tags,
      availability: p.availability as 'all' | 'members',
      validUntil: p.validUntil?.toISOString().split('T')[0] || '',
      termsAndConditions: p.termsAndConditions || '',
      howToUse: p.howToUse,
      features: p.features,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      createdDate: p.createdAt.toISOString().split('T')[0],
      usageCount: p.usageCount,
      maxUsages: p.maxUsages || undefined,
    });

    return NextResponse.json({
      success: true,
      data: {
        product: transformProduct(product),
        relatedProducts: relatedProducts.map(transformProduct),
      },
    }, { headers });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch product',
        data: null,
      },
      { status: 500 }
    );
  }
}
