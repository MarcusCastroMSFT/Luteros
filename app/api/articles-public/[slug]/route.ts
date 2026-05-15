import { NextRequest, NextResponse } from 'next/server'
import { getArticleBySlug } from '@/lib/articles'
import {
  getCurrentUserAccessContext,
  hasArticleAccess,
  truncateHtmlContent,
} from '@/lib/subscriptions'

const PAYWALL_PREVIEW_CHARS = 500

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

    // Enforce paywall at the API boundary too — never ship full paid content
    // to a client that isn't entitled.
    const accessContext = await getCurrentUserAccessContext()
    const article = data.article
    const isGated = !hasArticleAccess(
      { accessType: article.accessType ?? 'free', targetAudience: article.targetAudience ?? 'general' },
      accessContext,
    )

    const safeArticle = isGated && article.content
      ? { ...article, content: truncateHtmlContent(article.content, PAYWALL_PREVIEW_CHARS) }
      : article

    return NextResponse.json({
      success: true,
      data: {
        article: safeArticle,
        relatedArticles: data.relatedArticles,
        gated: isGated,
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
