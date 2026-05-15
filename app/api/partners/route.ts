import { NextRequest, NextResponse } from 'next/server';
import { and, asc, desc, eq, ilike, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { productPartners } from '@/lib/db/schema';
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

    const searchWhere = search ? ilike(productPartners.name, `%${search}%`) : undefined
    const statusWhere = status === 'active' ? eq(productPartners.isActive, true)
      : status === 'inactive' ? eq(productPartners.isActive, false) : undefined
    const where = and(searchWhere, statusWhere)

    const sortColMap: Record<string, unknown> = {
      name: productPartners.name,
      createdAt: productPartners.createdAt,
      email: productPartners.email,
    }
    const sortCol = (sortColMap[sortBy] ?? productPartners.createdAt) as Parameters<typeof asc>[0]
    const orderFn = sortOrder === 'asc' ? asc : desc

    const [[{ totalCount }], partners] = await Promise.all([
      db.select({ totalCount: sql<number>`count(*)::int` }).from(productPartners).where(where),
      db.select({
        id: productPartners.id, name: productPartners.name, slug: productPartners.slug,
        logo: productPartners.logo, website: productPartners.website, email: productPartners.email,
        phone: productPartners.phone, description: productPartners.description,
        isActive: productPartners.isActive, createdAt: productPartners.createdAt,
        productsCount: sql<number>`(SELECT COUNT(*)::int FROM "products" p WHERE p."partnerId" = ${productPartners.id})`,
      }).from(productPartners).where(where).orderBy(orderFn(sortCol)).offset((page - 1) * pageSize).limit(pageSize),
    ])

    // Format response for dashboard table
    const formattedPartners = partners.map((partner) => ({
      id: partner.id,
      name: partner.name,
      slug: partner.slug,
      logo: partner.logo,
      website: partner.website,
      email: partner.email,
      phone: partner.phone,
      description: partner.description,
      productsCount: partner.productsCount,
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
    const existingPartner = await db.select({ id: productPartners.id }).from(productPartners).where(eq(productPartners.slug, slug)).limit(1).then((r) => r[0] ?? null);

    if (existingPartner) {
      return NextResponse.json(
        { success: false, error: 'Já existe um parceiro com este slug' },
        { status: 400 }
      );
    }

    const [partner] = await db.insert(productPartners).values({
        name,
        slug,
        logo,
        website,
        description,
        email,
        phone,
        isActive,
      }).returning();

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
