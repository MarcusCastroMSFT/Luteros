import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const pageParam = parseInt(searchParams.get('page') || '0');
    // Handle both 0-indexed and 1-indexed page numbers
    const page = pageParam === 0 ? 1 : pageParam;
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const status = searchParams.get('status');

    // Build where clause
    const where: {
      OR?: { name: { contains: string; mode: 'insensitive' }; }[];
      isActive?: boolean;
    } = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    // Get total count for pagination
    const totalCount = await prisma.product_partners.count({ where });

    // Build orderBy
    const orderBy: Record<string, string> = {};
    const validSortFields = ['name', 'createdAt', 'email'];
    if (validSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy['createdAt'] = 'desc';
    }

    // Get partners with pagination
    const partners = await prisma.product_partners.findMany({
      where,
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Format response for dashboard table
    const formattedPartners = partners.map((partner: typeof partners[number]) => ({
      id: partner.id,
      name: partner.name,
      slug: partner.slug,
      logo: partner.logo,
      website: partner.website,
      email: partner.email,
      phone: partner.phone,
      description: partner.description,
      productsCount: partner._count.products,
      status: partner.isActive ? 'Ativo' : 'Inativo',
      createdAt: partner.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedPartners,
      pagination: {
        page,
        pageSize,
        totalCount,
        pageCount: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partners' },
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
    const { name, slug, logo, website, description, email, phone, isActive = true } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Nome e slug são obrigatórios' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingPartner = await prisma.product_partners.findUnique({
      where: { slug },
    });

    if (existingPartner) {
      return NextResponse.json(
        { success: false, error: 'Já existe um parceiro com este slug' },
        { status: 400 }
      );
    }

    const partner = await prisma.product_partners.create({
      data: {
        name,
        slug,
        logo,
        website,
        description,
        email,
        phone,
        isActive,
      },
    });

    return NextResponse.json({
      success: true,
      data: partner,
    });
  } catch (error) {
    console.error('Error creating partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create partner' },
      { status: 500 }
    );
  }
}
