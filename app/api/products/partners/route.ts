import { NextRequest, NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
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

    const partners = await db.select({
      id: productPartners.id, name: productPartners.name, slug: productPartners.slug,
      logo: productPartners.logo, website: productPartners.website, description: productPartners.description,
    }).from(productPartners).where(eq(productPartners.isActive, true)).orderBy(asc(productPartners.name));

    return NextResponse.json({
      success: true,
      data: partners,
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
    const { name, slug, logo, website, description, email, phone } = body;

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
