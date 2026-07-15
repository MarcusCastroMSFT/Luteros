// Serves /llms.txt — a Markdown guide that helps AI engines (ChatGPT, Perplexity,
// Gemini, Claude, etc.) understand the site's purpose and find key content.
// See https://llmstxt.org for the emerging convention.

export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lutteros.com.br'

  const body = `# lutteros

> Plataforma brasileira de educação em saúde sexual e bem-estar. Promovemos educação, bem-estar e respeito para todas as pessoas, em um espaço seguro, inclusivo e livre de tabus. Oferecemos artigos validados por especialistas, cursos online, eventos e uma comunidade acolhedora.

Idioma principal: Português (pt-BR).

## Conteúdo principal

- [Artigos](${baseUrl}/articles): Artigos sobre saúde sexual, educação e bem-estar, validados por médicos e especialistas.
- [Cursos](${baseUrl}/courses): Cursos online sobre saúde sexual e bem-estar.
- [Eventos](${baseUrl}/events): Eventos, palestras e encontros presenciais e online.
- [Especialistas](${baseUrl}/specialists): Profissionais de saúde, sexologia e psicologia.
- [Comunidade](${baseUrl}/community): Espaço seguro para dúvidas e discussões.
- [Produtos e parceiros](${baseUrl}/products): Descontos e benefícios de parceiros.

## Institucional

- [Sobre](${baseUrl}/about): Nossa história e missão.
- [Planos e preços](${baseUrl}/pricing): Assinaturas e benefícios.
- [Central de ajuda](${baseUrl}/help): Perguntas frequentes e suporte.
- [Termos de uso](${baseUrl}/terms)
- [Política de privacidade](${baseUrl}/privacy)

## Observações

- O conteúdo é informativo e educativo; não substitui consulta médica individual.
- Sitemap: ${baseUrl}/sitemap.xml
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
