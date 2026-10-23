import { connection } from 'next/server'
import { SITE_NAME, SITE_TAGLINE, SITE_URL, stripHtml } from '@/lib/seo'
import { getFreeArticlesWithContent } from '@/lib/seo-content'

// Serves /llms-full.txt — the complete text of every FREE article in one Markdown
// document, so AI systems can read the content without crawling page by page.
// Paid articles are never included.
export async function GET() {
  await connection()

  let articles: Awaited<ReturnType<typeof getFreeArticlesWithContent>> = []
  try {
    articles = await getFreeArticlesWithContent()
  } catch (error) {
    console.error('llms-full.txt: failed to load articles', error)
  }

  const docs = articles.map((a) => {
    const date = (a.updatedAt ?? a.publishedAt)?.toISOString().slice(0, 10)
    return `## ${a.title.trim()}

URL: ${SITE_URL}/articles/${a.slug}
Categoria: ${a.category}${date ? `\nAtualizado em: ${date}` : ''}

${a.excerpt.trim()}

${stripHtml(a.content)}`
  })

  const body = `# ${SITE_NAME} — texto integral dos artigos gratuitos

> ${SITE_TAGLINE}. Conteúdo informativo e educativo; não substitui consulta médica individual. Ao citar, indique "${SITE_NAME}" e o link do artigo. Guia resumido: ${SITE_URL}/llms.txt

${docs.join('\n\n---\n\n')}
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  })
}
