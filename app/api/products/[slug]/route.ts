import { NextRequest, NextResponse } from 'next/server';
import { sampleProducts } from '@/data/products';
import { ProductApiResponse } from '@/types/product';
import { isDevelopment } from '@/lib/config';

interface Props {
  params: Promise<{ slug: string }>;
}

// TODO: Replace with database queries - currently using sample data
export async function GET(request: NextRequest, { params }: Props) {
  // In production/UAT, this should query the database
  if (!isDevelopment) {
    console.warn('Products API: Using sample data in non-development environment. Connect to database.');
  }
  
  try {
    const { slug } = await params;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Find product by slug
    const product = sampleProducts.find(p => p.slug === slug && p.isActive);

    if (!product) {
      const response: ProductApiResponse = {
        success: false,
        error: 'Product not found',
        data: null,
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Get related products (same category, excluding current product)
    const relatedProducts = sampleProducts
      .filter(p => 
        p.slug !== slug && 
        p.category === product.category && 
        p.isActive
      )
      .sort((a, b) => {
        // Sort by featured first, then by usage count
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return b.usageCount - a.usageCount;
      })
      .slice(0, 4);

    const response: ProductApiResponse = {
      success: true,
      data: {
        product,
        relatedProducts,
      },
    };

    return NextResponse.json(response);

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
