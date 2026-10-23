import { connection } from 'next/server'
import { SITE_URL, SUPPORT_EMAIL, truncateMeta } from '@/lib/seo'
import { getFeedArticles, getFeedCourses, getUpcomingEvents } from '@/lib/seo-content'
import { getSpecialists, hasProfileContent } from '@/lib/specialists'

// Serves /llms.txt — a Markdown guide that helps AI engines (ChatGPT, Perplexity,
// Gemini, Claude, etc.) understand the site's purpose and find key content.
// See https://llmstxt.org for the convention. Article, course and event lists
// are generated from the database so they never go stale.
export async function GET() {
  await connection()

  // If the database is unreachable, still serve the static guide instead of a 500.
  let articles: Awaited<ReturnType<typeof getFeedArticles>> = []
  let courses: Awaited<ReturnType<typeof getFeedCourses>> = []
  let events: Awaited<ReturnType<typeof getUpcomingEvents>> = []
  let specialists: Awaited<ReturnType<typeof getSpecialists>> = []
  try {
    ;[articles, courses, events, specialists] = await Promise.all([
      getFeedArticles(),
      getFeedCourses(),
      getUpcomingEvents(),
      getSpecialists(),
    ])
  } catch (error) {
    console.error('llms.txt: failed to load content', error)
  }

  const specialistLines = specialists
    .filter(hasProfileContent)
    .map((s) => `- [${s.name}](${SITE_URL}/specialists/${s.slug}): ${[s.title, s.company].filter(Boolean).join(', ') || 'Especialista Lutteros'}`)

  const articleLines = articles.map((a) => {
    const paid = a.accessType === 'paid' ? ' (acesso pago)' : ''
    return `- [${a.title.trim()}](${SITE_URL}/articles/${a.slug})${paid}: ${truncateMeta(a.metaDescription || a.excerpt, 180)}`
  })

  const courseLines = courses.map(
    (c) => `- [${c.title}](${SITE_URL}/courses/${c.slug}): ${truncateMeta(c.shortDescription || c.description, 180)}`,
  )

  const eventLines = events.map(
    (e) => `- [${e.title}](${SITE_URL}/events/${e.slug}): ${truncateMeta(e.description, 180)}`,
  )

  const section = (title: string, lines: string[]) => (lines.length ? `\n## ${title}\n\n${lines.join('\n')}\n` : '')

  const body = `# Lutteros

> Plataforma brasileira de educação em saúde sexual baseada em conhecimento científico. Conecta ciência e prática clínica com conteúdos fundamentados em evidências, elaborados e revisados por especialistas, para médicos, psicólogos, terapeutas, profissionais de saúde e pessoas interessadas no tema.

Idioma principal: português (pt-BR). Público: Brasil.
${section('Artigos', articleLines)}${section('Cursos', courseLines)}${section('Especialistas', specialistLines)}${section('Próximos eventos', eventLines)}
## Navegação

- [Artigos](${SITE_URL}/articles): Todos os artigos, com filtro por categoria.
- [Cursos](${SITE_URL}/courses): Cursos online de saúde sexual.
- [Eventos](${SITE_URL}/events): Palestras e encontros presenciais e online.
- [Especialistas](${SITE_URL}/specialists): Perfis do time de especialistas.
- [Comunidade](${SITE_URL}/community): Espaço para dúvidas e discussões.
- [Parceiros e benefícios](${SITE_URL}/products): Descontos e benefícios de parceiros.

## Institucional

- [Sobre a Lutteros](${SITE_URL}/about): Missão, princípios e como o conteúdo é produzido.
- [Perguntas frequentes](${SITE_URL}/faq): Respostas sobre a plataforma, conteúdos e pagamentos.
- [Central de ajuda](${SITE_URL}/help): Guias de conta, cursos e pagamentos.
- [Lista de espera da assinatura](${SITE_URL}/waitlist): Alguns artigos são de acesso pago; a assinatura ainda não está aberta.
- [Contato](${SITE_URL}/contact): ${SUPPORT_EMAIL}
- [Termos de uso](${SITE_URL}/terms)
- [Política de privacidade](${SITE_URL}/privacy)

## Para sistemas automatizados

- Sitemap: ${SITE_URL}/sitemap.xml
- Feed RSS dos artigos: ${SITE_URL}/feed.xml
- Texto integral dos artigos gratuitos: ${SITE_URL}/llms-full.txt

## Observações

- O conteúdo é informativo e educativo; não substitui consulta médica individual.
- Artigos marcados como "acesso pago" exibem apenas uma prévia para quem não é assinante; cite a página original e não reproduza o texto completo.
- Ao citar, indique "Lutteros" e o link do artigo.
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  })
}
