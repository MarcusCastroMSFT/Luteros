import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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

    const partner = await prisma.product_partners.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        },
        products: {
          select: {
            id: true,
            title: true,
            slug: true,
            isActive: true,
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

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
        productsCount: partner._count.products,
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
    const existingPartner = await prisma.product_partners.findUnique({
      where: { id },
    });

    if (!existingPartner) {
      return NextResponse.json(
        { success: false, error: 'Parceiro não encontrado' },
        { status: 404 }
      );
    }

    // Check if slug is being changed and if new slug already exists
    if (slug && slug !== existingPartner.slug) {
      const slugExists = await prisma.product_partners.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Já existe um parceiro com este slug' },
          { status: 400 }
        );
      }
    }

    const updatedPartner = await prisma.product_partners.update({
      where: { id },
      data: {
        name: name || existingPartner.name,
        slug: slug || existingPartner.slug,
        logo: logo !== undefined ? logo : existingPartner.logo,
        website: website !== undefined ? website : existingPartner.website,
        description: description !== undefined ? description : existingPartner.description,
        email: email !== undefined ? email : existingPartner.email,
        phone: phone !== undefined ? phone : existingPartner.phone,
        isActive: isActive !== undefined ? isActive : existingPartner.isActive,
      },
    });

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
    const existingPartner = await prisma.product_partners.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!existingPartner) {
      return NextResponse.json(
        { success: false, error: 'Parceiro não encontrado' },
        { status: 404 }
      );
    }

    // Delete partner (products will be cascade deleted due to schema configuration)
    await prisma.product_partners.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Parceiro excluído com sucesso. ${existingPartner._count.products} produto(s) foram removidos.`,
    });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete partner' },
      { status: 500 }
    );
  }
}
