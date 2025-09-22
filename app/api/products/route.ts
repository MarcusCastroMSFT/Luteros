import { NextRequest, NextResponse } from 'next/server';
import { sampleProducts, productCategories } from '@/data/products';
import { ProductsApiResponse } from '@/types/product';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1') - 1; // Convert to 0-based
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const availability = searchParams.get('availability') || '';
    const featured = searchParams.get('featured') === 'true';

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Filter products based on search criteria
    let filteredProducts = sampleProducts.filter(product => product.isActive);

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.title.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.shortDescription.toLowerCase().includes(searchLower) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        product.partner.name.toLowerCase().includes(searchLower)
      );
    }

    if (category) {
      filteredProducts = filteredProducts.filter(product =>
        product.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (availability) {
      filteredProducts = filteredProducts.filter(product =>
        product.availability === availability
      );
    }

    if (featured) {
      filteredProducts = filteredProducts.filter(product => product.isFeatured);
    }

    // Sort by featured first, then by creation date
    filteredProducts.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    });

    // Calculate pagination
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = page * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    const response: ProductsApiResponse = {
      success: true,
      data: paginatedProducts,
      pagination: {
        page: page + 1, // Convert back to 1-based
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages - 1,
        hasPreviousPage: page > 0,
      },
      categories: productCategories,
    };

    return NextResponse.json(response);

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
