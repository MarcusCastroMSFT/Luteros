import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ProductApiResponse } from '@/types/product';
import { requireAdminOrInstructor } from '@/lib/auth-helpers';
import { revalidatePath, revalidateTag } from 'next/cache';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  // Add cache tag for manual invalidation
  const headers = new Headers({
    'Cache-Tag': 'products',
  });

  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const adminMode = searchParams.get('admin') === 'true';

    // Build where clause - for admin mode, find by slug OR id without isActive filter
    let product;
    
    if (adminMode) {
      // Admin mode: find by slug or id, include inactive products
      product = await prisma.products.findFirst({
        where: {
          OR: [
            { slug },
            { id: slug },
          ],
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
          partnerId: true,
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
    } else {
      // Public mode: find by slug only, active products only
      product = await prisma.products.findUnique({
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
    }

    if (!product) {
      const response: ProductApiResponse = {
        success: false,
        error: 'Product not found',
        data: null,
      };
      return NextResponse.json(response, { status: 404, headers });
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
      orderBy: [
        { isFeatured: 'desc' },
        { usageCount: 'desc' },
      ],
      take: 4,
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

    const response: ProductApiResponse = {
      success: true,
      data: {
        product: transformProduct(product),
        relatedProducts: relatedProducts.map(transformProduct),
      },
    };

    return NextResponse.json(response, { headers });

  } catch (error) {
    console.error('Error fetching product:', error);
    const response: ProductApiResponse = {
      success: false,
      error: 'Failed to fetch product',
      data: null,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params;

    // Verify authentication and authorization (admin or instructor only)
    const authResult = await requireAdminOrInstructor(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Return 401/403 response
    }

    // Find product by slug or id
    const product = await prisma.products.findFirst({
      where: {
        OR: [
          { slug },
          { id: slug },
        ],
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete the product
    await prisma.products.delete({
      where: { id: product.id },
    });

    // Revalidate all product-related cache tags
    revalidateTag('products', {});
    revalidateTag('featured-products', {});
    revalidateTag('product-slugs', {});
    revalidateTag(`product-${product.slug}`, {});
    revalidateTag(`related-products-${product.id}`, {});
    revalidatePath('/products');
    revalidatePath(`/products/${product.slug}`);
    revalidatePath('/dashboard/products');

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { slug: productSlugOrId } = await params;

    // Verify authentication
    const authResult = await requireAdminOrInstructor(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Find product by slug or id
    const existingProduct = await prisma.products.findFirst({
      where: {
        OR: [
          { slug: productSlugOrId },
          { id: productSlugOrId },
        ],
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      title,
      slug,
      description,
      shortDescription,
      image,
      partnerId,
      discountPercentage,
      discountType,
      originalPrice,
      discountedPrice,
      discountAmount,
      promoCode,
      category,
      tags,
      availability,
      validUntil,
      termsAndConditions,
      howToUse,
      features,
      isActive,
      isFeatured,
      maxUsages,
    } = body;

    // Validation
    if (!title || !slug || !description || !shortDescription || !partnerId || !promoCode || !category) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Check if new slug conflicts with another product
    if (slug !== existingProduct.slug) {
      const conflictingProduct = await prisma.products.findUnique({
        where: { slug },
      });

      if (conflictingProduct) {
        return NextResponse.json(
          { success: false, error: 'Já existe outro produto com este slug' },
          { status: 400 }
        );
      }
    }

    const product = await prisma.products.update({
      where: { id: existingProduct.id },
      data: {
        title,
        slug,
        description,
        shortDescription,
        image: image || null,
        partnerId,
        discountPercentage: discountPercentage || 0,
        discountType: discountType || 'percentage',
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
        discountAmount: discountAmount ? parseFloat(discountAmount) : null,
        promoCode,
        category,
        tags: tags || [],
        availability: availability || 'all',
        validUntil: validUntil ? new Date(validUntil) : null,
        termsAndConditions: termsAndConditions || null,
        howToUse: howToUse || [],
        features: features || [],
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        maxUsages: maxUsages || null,
      },
      include: {
        partner: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    // Revalidate all product-related cache tags
    revalidateTag('products', {});
    revalidateTag('featured-products', {});
    revalidateTag(`product-${slug}`, {});
    revalidateTag(`related-products-${existingProduct.id}`, {});
    // Also revalidate old slug if changed
    if (slug !== existingProduct.slug) {
      revalidateTag(`product-${existingProduct.slug}`, {});
      revalidatePath(`/products/${existingProduct.slug}`);
    }
    revalidatePath('/products');
    revalidatePath(`/products/${slug}`);
    revalidatePath('/dashboard/products');

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar produto' },
      { status: 500 }
    );
  }
}
