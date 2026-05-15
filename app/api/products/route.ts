import { NextRequest, NextResponse } from 'next/server';
import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { products, productPartners } from '@/lib/db/schema';
import { ProductsApiResponse } from '@/types/product';
import { requireAdmin } from '@/lib/auth-helpers';
import { revalidatePath, revalidateTag } from '@/lib/cache';

export async function GET(request: NextRequest) {
  // Add cache tag for manual invalidation
  const headers = new Headers({
    'Cache-Tag': 'products',
  });

  try {
    const { searchParams } = new URL(request.url);
    
    // Check if this is an admin dashboard request (uses different pagination params)
    const isAdminRequest = searchParams.has('pageSize');
    
    if (isAdminRequest) {
      // Admin dashboard format - requires authentication
      const authResult = await requireAdmin(request);
      if (authResult instanceof NextResponse) {
        return authResult;
      }
      
      const page = parseInt(searchParams.get('page') || '0');
      const pageSize = parseInt(searchParams.get('pageSize') || '10');
      const search = searchParams.get('search') || '';
      const sortBy = searchParams.get('sortBy') || 'createdAt';
      const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
      
      // Build where condition
      const searchWhere = search ? or(
        ilike(products.title, `%${search}%`),
        ilike(products.category, `%${search}%`),
        ilike(products.promoCode, `%${search}%`),
        ilike(productPartners.name, `%${search}%`),
      ) : undefined

      const sortColMap: Record<string, unknown> = {
        title: products.title,
        partner: productPartners.name,
        category: products.category,
        discount: products.discountPercentage,
        usageCount: products.usageCount,
        validUntil: products.validUntil,
        createdAt: products.createdAt,
      }
      const sortCol = (sortColMap[sortBy] ?? products.createdAt) as Parameters<typeof asc>[0]
      const orderFn = sortOrder === 'asc' ? asc : desc

      const [productsRows, [{ total }]] = await Promise.all([
        db.select({
          id: products.id, title: products.title, slug: products.slug, category: products.category,
          discountPercentage: products.discountPercentage, promoCode: products.promoCode,
          availability: products.availability, isActive: products.isActive, isFeatured: products.isFeatured,
          usageCount: products.usageCount, maxUsages: products.maxUsages, validUntil: products.validUntil,
          createdAt: products.createdAt, partnerName: productPartners.name,
        }).from(products).innerJoin(productPartners, eq(products.partnerId, productPartners.id))
          .where(searchWhere).orderBy(orderFn(sortCol)).offset(page * pageSize).limit(pageSize),
        db.select({ total: sql<number>`count(*)::int` }).from(products)
          .innerJoin(productPartners, eq(products.partnerId, productPartners.id)).where(searchWhere),
      ])

      // Transform for admin dashboard table
      const transformedProducts = productsRows.map((product) => ({
        id: product.id,
        title: product.title,
        slug: product.slug,
        partner: product.partnerName,
        category: product.category,
        discount: product.discountPercentage,
        promoCode: product.promoCode,
        availability: product.availability as 'all' | 'members',
        status: product.isActive ? 'Ativo' : 'Inativo',
        isFeatured: product.isFeatured,
        usageCount: product.usageCount,
        maxUsages: product.maxUsages || undefined,
        validUntil: product.validUntil?.toISOString() || '',
        createdAt: product.createdAt.toISOString(),
      }));
      
      const totalCount = Number(total)
      const pageCount = Math.ceil(totalCount / pageSize);
      
      return NextResponse.json({
        data: transformedProducts,
        totalCount,
        pageCount,
        page,
        pageSize,
      }, { headers });
    }
    
    // Public API format - original behavior
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const availability = searchParams.get('availability') || '';
    const featured = searchParams.get('featured') === 'true';

    // Build where clause for active products only
    const whereParts = [
      eq(products.isActive, true),
      search ? or(ilike(products.title, `%${search}%`), ilike(products.shortDescription, `%${search}%`), ilike(products.category, `%${search}%`), ilike(productPartners.name, `%${search}%`)) : undefined,
      category ? eq(products.category, category) : undefined,
      availability ? eq(products.availability, availability) : undefined,
      featured ? eq(products.isFeatured, true) : undefined,
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

    const response: ProductsApiResponse = {
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
    };

    return NextResponse.json(response, { headers });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products',
        data: [],
        pagination: {
          page: 1,
          limit: 12,
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

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
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
        { success: false, error: 'Campos obrigatÃ³rios faltando: tÃ­tulo, slug, descriÃ§Ã£o, descriÃ§Ã£o curta, parceiro, cÃ³digo promocional e categoria sÃ£o obrigatÃ³rios' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingProduct = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1).then((r) => r[0] ?? null);

    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: 'JÃ¡ existe um produto com este slug' },
        { status: 400 }
      );
    }

    // Check if partner exists
    const partner = await db.select({ id: productPartners.id }).from(productPartners).where(eq(productPartners.id, partnerId)).limit(1).then((r) => r[0] ?? null);

    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Parceiro nÃ£o encontrado' },
        { status: 400 }
      );
    }

    const [product] = await db.insert(products).values({
        title,
        slug,
        description,
        shortDescription,
        image: image || null,
        partnerId,
        discountPercentage: discountPercentage || 0,
        discountType: discountType || 'percentage',
        originalPrice: originalPrice ? String(parseFloat(originalPrice)) : null,
        discountedPrice: discountedPrice ? String(parseFloat(discountedPrice)) : null,
        discountAmount: discountAmount ? String(parseFloat(discountAmount)) : null,
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
      }).returning();

    // Revalidate all product-related cache tags
    revalidateTag('products');
    revalidateTag('featured-products');
    revalidateTag('product-slugs');
    revalidatePath('/products');
    revalidatePath(`/products/${slug}`);
    revalidatePath('/admin/products');

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar produto' },
      { status: 500 }
    );
  }
}
