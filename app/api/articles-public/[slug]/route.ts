import { NextRequest, NextResponse } from 'next/server'
import { getArticleBySlug } from '@/lib/articles'

interface Props {
  params: Promise<{ slug: string }>
}

export async function GET(_request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params
    const data = await getArticleBySlug(slug)

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Article not found', data: null },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        article: data.article,
        relatedArticles: data.relatedArticles,
      },
    })
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch article', data: null },
      { status: 500 }
    )
  }
}
