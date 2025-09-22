import { NextResponse } from 'next/server';
import { helpArticles } from '@/data/help';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const { slug } = await params;
    const article = helpArticles[slug];

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found', success: false },
        { status: 404 }
      );
    }

    // Get related articles
    const relatedArticleData = article.relatedArticles
      .map(relatedSlug => helpArticles[relatedSlug])
      .filter(Boolean)
      .slice(0, 3); // Limit to 3 related articles

    return NextResponse.json({
      article,
      relatedArticles: relatedArticleData,
      success: true
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article', success: false },
      { status: 500 }
    );
  }
}
