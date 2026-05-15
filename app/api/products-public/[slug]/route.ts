import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products, productPartners } from '@/lib/db/schema'
import { and, desc, eq, ne } from 'drizzle-orm'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const headers = new Headers({ 'Cache-Tag': 'products-public' })

  try {
    const { slug } = await params

    const productCols = {
      id: products.id,
      slug: products.slug,
      title: products.title,
      description: products.description,
      shortDescription: products.shortDescription,
      image: products.image,
      discountPercentage: products.discountPercentage,
      discountType: products.discountType,
      originalPrice: products.originalPrice,
      discountedPrice: products.discountedPrice,
      discountAmount: products.discountAmount,
      promoCode: products.promoCode,
      category: products.category,
      tags: products.tags,
      availability: products.availability,
      validUntil: products.validUntil,
      termsAndConditions: products.termsAndConditions,
      howToUse: products.howToUse,
      features: products.features,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      usageCount: products.usageCount,
      maxUsages: products.maxUsages,
      createdAt: products.createdAt,
      partnerId: productPartners.id,
      partnerName: productPartners.name,
      partnerLogo: productPartners.logo,
      partnerWebsite: productPartners.website,
    }

    const row = await db
      .select(productCols)
      .from(products)
      .innerJoin(productPartners, eq(products.partnerId, productPartners.id))
      .where(and(eq(products.slug, slug), eq(products.isActive, true)))
      .limit(1)
      .then((r) => r[0] ?? null)

    if (!row) {
      return NextResponse.json(
        { success: false, error: 'Product not found', data: null },
        { status: 404, headers }
      )
    }

    const relatedRows = await db
      .select(productCols)
      .from(products)
      .innerJoin(productPartners, eq(products.partnerId, productPartners.id))
      .where(and(eq(products.isActive, true), eq(products.category, row.category), ne(products.id, row.id)))
      .orderBy(desc(products.isFeatured))
      .limit(3)

    const transformProduct = (p: typeof row) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      shortDescription: p.shortDescription,
      image: p.image || '',
      partner: {
        id: p.partnerId,
        name: p.partnerName,
        logo: p.partnerLogo || '',
        website: p.partnerWebsite || '',
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
    })

    return NextResponse.json({
      success: true,
      data: {
        product: transformProduct(row),
        relatedProducts: relatedRows.map(transformProduct),
      },
    }, { headers })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product', data: null },
      { status: 500 }
    )
  }
}
