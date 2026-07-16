import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products, productPartners } from '@/lib/db/schema'
import { ProductApiResponse } from '@/types/product'
import { requireAdmin } from '@/lib/auth-helpers'
import { revalidatePath, revalidateTag } from '@/lib/cache'
import { submitToIndexNow } from '@/lib/indexnow'
import { and, desc, eq, ne, or } from 'drizzle-orm'

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  const headers = new Headers({ 'Cache-Tag': 'products' })

  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const adminMode = searchParams.get('admin') === 'true'

    const baseSelect = {
      id: products.id, slug: products.slug, title: products.title,
      description: products.description, shortDescription: products.shortDescription,
      image: products.image, discountPercentage: products.discountPercentage,
      discountType: products.discountType, originalPrice: products.originalPrice,
      discountedPrice: products.discountedPrice, discountAmount: products.discountAmount,
      promoCode: products.promoCode, category: products.category, tags: products.tags,
      availability: products.availability, validUntil: products.validUntil,
      termsAndConditions: products.termsAndConditions, howToUse: products.howToUse,
      features: products.features, isActive: products.isActive, isFeatured: products.isFeatured,
      usageCount: products.usageCount, maxUsages: products.maxUsages, createdAt: products.createdAt,
      partnerId: productPartners.id, partnerName: productPartners.name,
      partnerSlug: productPartners.slug, partnerLogo: productPartners.logo,
      partnerWebsite: productPartners.website,
    }

    const whereBySlugOrId = or(eq(products.slug, slug), eq(products.id, slug))

    const product = adminMode
      ? await db.select(baseSelect).from(products)
          .innerJoin(productPartners, eq(products.partnerId, productPartners.id))
          .where(whereBySlugOrId).limit(1).then((r) => r[0] ?? null)
      : await db.select(baseSelect).from(products)
          .innerJoin(productPartners, eq(products.partnerId, productPartners.id))
          .where(and(eq(products.slug, slug), eq(products.isActive, true))).limit(1).then((r) => r[0] ?? null)

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found', data: null } as ProductApiResponse, { status: 404, headers })
    }

    const relatedProducts = await db.select(baseSelect).from(products)
      .innerJoin(productPartners, eq(products.partnerId, productPartners.id))
      .where(and(eq(products.isActive, true), eq(products.category, product.category), ne(products.id, product.id)))
      .orderBy(desc(products.isFeatured), desc(products.usageCount))
      .limit(4)

    const transformProduct = (p: typeof product) => ({
      id: p.id, slug: p.slug, title: p.title, description: p.description,
      shortDescription: p.shortDescription, image: p.image || '',
      partner: { id: p.partnerId, name: p.partnerName, logo: p.partnerLogo || '', website: p.partnerWebsite || '' },
      discount: {
        percentage: p.discountPercentage,
        amount: p.discountAmount ? Number(p.discountAmount) : undefined,
        type: p.discountType as 'percentage' | 'fixed',
        originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
        discountedPrice: p.discountedPrice ? Number(p.discountedPrice) : undefined,
      },
      promoCode: p.promoCode, category: p.category, tags: p.tags,
      availability: p.availability as 'all' | 'members',
      validUntil: p.validUntil?.toISOString().split('T')[0] || '',
      termsAndConditions: p.termsAndConditions || '', howToUse: p.howToUse, features: p.features,
      isActive: p.isActive, isFeatured: p.isFeatured,
      createdDate: p.createdAt.toISOString().split('T')[0],
      usageCount: p.usageCount, maxUsages: p.maxUsages || undefined,
    })

    return NextResponse.json({ success: true, data: { product: transformProduct(product), relatedProducts: relatedProducts.map(transformProduct) } } as ProductApiResponse, { headers })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch product', data: null } as ProductApiResponse, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) return authResult

    const product = await db.select({ id: products.id, slug: products.slug }).from(products)
      .where(or(eq(products.slug, slug), eq(products.id, slug))).limit(1).then((r) => r[0] ?? null)

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    await db.delete(products).where(eq(products.id, product.id))

    revalidateTag('products')
    revalidateTag('featured-products')
    revalidateTag('product-slugs')
    revalidateTag(`product-${product.slug}`)
    revalidateTag(`related-products-${product.id}`)
    revalidatePath('/products')
    revalidatePath(`/products/${product.slug}`)
    revalidatePath('/admin/products')

    return NextResponse.json({ success: true, message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { slug: productSlugOrId } = await params
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) return authResult

    const existingProduct = await db.select().from(products)
      .where(or(eq(products.slug, productSlugOrId), eq(products.id, productSlugOrId))).limit(1).then((r) => r[0] ?? null)

    if (!existingProduct) {
      return NextResponse.json({ success: false, error: 'Produto não encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const {
      title, slug, description, shortDescription, image, partnerId,
      discountPercentage, discountType, originalPrice, discountedPrice,
      discountAmount, promoCode, category, tags, availability, validUntil,
      termsAndConditions, howToUse, features, isActive, isFeatured, maxUsages,
    } = body

    if (!title || !slug || !description || !shortDescription || !partnerId || !promoCode || !category) {
      return NextResponse.json({ success: false, error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    if (slug !== existingProduct.slug) {
      const conflict = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1).then((r) => r[0] ?? null)
      if (conflict) {
        return NextResponse.json({ success: false, error: 'Já existe outro produto com este slug' }, { status: 400 })
      }
    }

    const [product] = await db.update(products).set({
      title, slug, description, shortDescription,
      image: image || null, partnerId,
      discountPercentage: discountPercentage || 0,
      discountType: discountType || 'percentage',
      originalPrice: originalPrice ? String(parseFloat(originalPrice)) : null,
      discountedPrice: discountedPrice ? String(parseFloat(discountedPrice)) : null,
      discountAmount: discountAmount ? String(parseFloat(discountAmount)) : null,
      promoCode, category, tags: tags || [],
      availability: availability || 'all',
      validUntil: validUntil ? new Date(validUntil) : null,
      termsAndConditions: termsAndConditions || null,
      howToUse: howToUse || [], features: features || [],
      isActive: isActive ?? true, isFeatured: isFeatured ?? false,
      maxUsages: maxUsages || null,
    }).where(eq(products.id, existingProduct.id)).returning()

    revalidateTag('products')
    revalidateTag('featured-products')
    revalidateTag(`product-${slug}`)
    revalidateTag(`related-products-${existingProduct.id}`)
    if (slug !== existingProduct.slug) {
      revalidateTag(`product-${existingProduct.slug}`)
      revalidatePath(`/products/${existingProduct.slug}`)
    }
    revalidatePath('/products')
    revalidatePath(`/products/${slug}`)
    revalidatePath('/admin/products')

    // Notify IndexNow when the product is active/visible
    if (isActive ?? true) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.lutteros.com.br'
      await submitToIndexNow([`${baseUrl}/products/${slug}`, `${baseUrl}/products`])
    }

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar produto' }, { status: 500 })
  }
}
