import { NextRequest, NextResponse } from 'next/server';
import { sampleArticles } from '@/data/articles';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Find article by slug
    const article = sampleArticles.find(article => article.slug === slug);

    if (!article) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Article not found',
          data: null,
        },
        { status: 404 }
      );
    }

    // Get related articles (same category, excluding current article)
    const relatedArticles = sampleArticles
      .filter(a => a.category === article.category && a.slug !== slug)
      .slice(0, 3);

    return NextResponse.json({
      success: true,
      data: {
        article,
        relatedArticles,
      },
    });

  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch article',
        data: null,
      },
      { status: 500 }
    );
  }
}
