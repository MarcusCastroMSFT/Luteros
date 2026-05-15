import { NextRequest, NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { productPartners, products } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth-helpers';

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Verify authentication
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await context.params;

    const partnerRow = await db.select({
      id: productPartners.id, name: productPartners.name, slug: productPartners.slug,
      logo: productPartners.logo, website: productPartners.website, email: productPartners.email,
      phone: productPartners.phone, description: productPartners.description,
      isActive: productPartners.isActive, createdAt: productPartners.createdAt, updatedAt: productPartners.updatedAt,
      productsCount: sql<number>`(SELECT COUNT(*)::int FROM "products" p WHERE p."partnerId" = ${productPartners.id})`,
    }).from(productPartners).where(eq(productPartners.id, id)).limit(1).then((r) => r[0] ?? null)

    const partnerProducts = partnerRow
      ? await db.select({ id: products.id, title: products.title, slug: products.slug, isActive: products.isActive })
          .from(products).where(eq(products.partnerId, id)).orderBy(sql`${products.createdAt} desc`).limit(10)
      : []

    const partner = partnerRow ? { ...partnerRow, products: partnerProducts } : null

    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Parceiro não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...partner,
        productsCount: partner.productsCount,
      },
    });
  } catch (error) {
    console.error('Error fetching partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partner' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Verify authentication
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await context.params;
    const body = await request.json();
    const { name, slug, logo, website, description, email, phone, isActive } = body;

    // Check if partner exists
    const existingPartner = await db.select().from(productPartners).where(eq(productPartners.id, id)).limit(1).then((r) => r[0] ?? null);

    if (!existingPartner) {
      return NextResponse.json(
        { success: false, error: 'Parceiro não encontrado' },
        { status: 404 }
      );
    }

    // Check if slug is being changed and if new slug already exists
    if (slug && slug !== existingPartner.slug) {
      const slugExists = await db.select({ id: productPartners.id }).from(productPartners).where(eq(productPartners.slug, slug)).limit(1).then((r) => r[0] ?? null);

      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Já existe um parceiro com este slug' },
          { status: 400 }
        );
      }
    }

    const [updatedPartner] = await db.update(productPartners).set({
      name: name || existingPartner.name,
      slug: slug || existingPartner.slug,
      logo: logo !== undefined ? logo : existingPartner.logo,
      website: website !== undefined ? website : existingPartner.website,
      description: description !== undefined ? description : existingPartner.description,
      email: email !== undefined ? email : existingPartner.email,
      phone: phone !== undefined ? phone : existingPartner.phone,
      isActive: isActive !== undefined ? isActive : existingPartner.isActive,
    }).where(eq(productPartners.id, id)).returning();

    return NextResponse.json({
      success: true,
      data: updatedPartner,
    });
  } catch (error) {
    console.error('Error updating partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update partner' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Verify authentication
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await context.params;

    // Check if partner exists
    const existingPartnerDel = await db.select({
      id: productPartners.id,
      productsCount: sql<number>`(SELECT COUNT(*)::int FROM "products" p WHERE p."partnerId" = ${productPartners.id})`,
    }).from(productPartners).where(eq(productPartners.id, id)).limit(1).then((r) => r[0] ?? null);

    if (!existingPartnerDel) {
      return NextResponse.json(
        { success: false, error: 'Parceiro não encontrado' },
        { status: 404 }
      );
    }

    // Delete partner (products will be cascade deleted due to schema configuration)
    await db.delete(productPartners).where(eq(productPartners.id, id));

    return NextResponse.json({
      success: true,
      message: `Parceiro excluído com sucesso. ${existingPartnerDel.productsCount} produto(s) foram removidos.`,
    });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete partner' },
      { status: 500 }
    );
  }
}
