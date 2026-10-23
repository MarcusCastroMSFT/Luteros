import { connection } from 'next/server'
import { SITE_NAME, SITE_TAGLINE, SITE_URL, escapeXml, truncateMeta } from '@/lib/seo'
import { getFeedArticles } from '@/lib/seo-content'

// RSS 2.0 feed of the latest published articles (readers, aggregators, AI crawlers).
export async function GET() {
  await connection()

  const rows = await getFeedArticles(30)
  const lastBuild = rows[0]?.updatedAt ?? rows[0]?.publishedAt ?? new Date()

  const items = rows
    .map((a) => {
      const url = `${SITE_URL}/articles/${a.slug}`
      const published = a.publishedAt ?? a.createdAt
      // Excerpt only: paid articles never leak their full text through the feed.
      return `    <item>
      <title>${escapeXml(a.title.trim())}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${published.toUTCString()}</pubDate>
      <category>${escapeXml(a.category)}</category>
      <description>${escapeXml(truncateMeta(a.metaDescription || a.excerpt, 400))}</description>
    </item>`
    })
    .join('\n')

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} — Artigos</title>
    <link>${SITE_URL}/articles</link>
    <description>${escapeXml(SITE_TAGLINE)}. Artigos elaborados e revisados por especialistas.</description>
    <language>pt-BR</language>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
