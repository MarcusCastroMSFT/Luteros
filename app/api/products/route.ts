import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ProductsApiResponse } from '@/types/product';
import { requireAdminOrInstructor } from '@/lib/auth-helpers';
import { revalidatePath, revalidateTag } from 'next/cache';

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
      const authResult = await requireAdminOrInstructor(request);
      if (authResult instanceof NextResponse) {
        return authResult;
      }
      
      const page = parseInt(searchParams.get('page') || '0');
      const pageSize = parseInt(searchParams.get('pageSize') || '10');
      const search = searchParams.get('search') || '';
      const sortBy = searchParams.get('sortBy') || 'createdAt';
      const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
      
      // Build where condition
      const whereCondition: Record<string, unknown> = {};
      
      if (search) {
        whereCondition.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
          { promoCode: { contains: search, mode: 'insensitive' } },
          { partner: { name: { contains: search, mode: 'insensitive' } } },
        ];
      }
      
      // Build orderBy condition
      const orderByMap: Record<string, Record<string, unknown>> = {
        title: { title: sortOrder },
        partner: { partner: { name: sortOrder } },
        category: { category: sortOrder },
        discount: { discountPercentage: sortOrder },
        usageCount: { usageCount: sortOrder },
        validUntil: { validUntil: sortOrder },
        createdAt: { createdAt: sortOrder },
      };
      
      const orderBy = orderByMap[sortBy] || { createdAt: sortOrder };
      
      const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
          where: whereCondition,
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            discountPercentage: true,
            promoCode: true,
            availability: true,
            isActive: true,
            isFeatured: true,
            usageCount: true,
            maxUsages: true,
            validUntil: true,
            createdAt: true,
            partner: {
              select: {
                name: true,
              },
            },
          },
          orderBy,
          skip: page * pageSize,
          take: pageSize,
        }),
        prisma.product.count({ where: whereCondition }),
      ]);
      
      // Transform for admin dashboard table
      const transformedProducts = products.map((product: typeof products[number]) => ({
        id: product.id,
        title: product.title,
        slug: product.slug,
        partner: product.partner.name,
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
    if (category) {
      whereClause.category = { equals: category, mode: 'insensitive' };
    }

    // Add availability filter if provided
    if (availability) {
      whereClause.availability = availability;
    }

    // Add featured filter if provided
    if (featured) {
      whereClause.isFeatured = true;
    }

    // Get total count, paginated products, and categories in parallel
    const [totalProducts, products, categoriesRaw] = await Promise.all([
      prisma.product.count({ where: whereClause }),
      prisma.product.findMany({
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
      prisma.product.groupBy({
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
        id: product.partner.id,
        name: product.partner.name,
        logo: product.partner.logo || '',
        website: product.partner.website || '',
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
    const authResult = await requireAdminOrInstructor(request);
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
        { success: false, error: 'Campos obrigatórios faltando: título, slug, descrição, descrição curta, parceiro, código promocional e categoria são obrigatórios' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Já existe um produto com este slug' },
        { status: 400 }
      );
    }

    // Check if partner exists
    const partner = await prisma.productPartner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Parceiro não encontrado' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
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
    revalidateTag('product-slugs', {});
    revalidatePath('/products');
    revalidatePath(`/products/${slug}`);
    revalidatePath('/dashboard/products');

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
