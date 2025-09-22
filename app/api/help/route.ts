import { NextResponse } from 'next/server';
import { helpCategories, popularArticles, quickActions } from '@/data/help';

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({
      categories: helpCategories,
      popularArticles,
      quickActions,
      success: true
    });
  } catch (error) {
    console.error('Error fetching help data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch help data', success: false },
      { status: 500 }
    );
  }
}
