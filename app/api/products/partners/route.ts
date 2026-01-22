import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminOrInstructor } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await requireAdminOrInstructor(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const partners = await prisma.product_partners.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        website: true,
        description: true,
      },
      orderBy: { name: 'asc' },
    });

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
    const authResult = await requireAdminOrInstructor(request);
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
