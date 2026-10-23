// Normalizes the HTML saved by the article editor before it is rendered, without touching the
// stored content. The editor writes figures inside <p> (invalid HTML: browsers close the <p>
// first, so the alignment is lost) and inline `!important` sizes/borders that no stylesheet can
// override. This turns that markup into clean, responsive elements styled by `.article-body`.

const ZOOM_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/></svg>'

function getAttr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, 'i'))
  return match ? match[1] : null
}

function styleValue(style: string | null, property: string): string | null {
  if (!style) return null
  const match = style.match(new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;!]+)`, 'i'))
  return match ? match[1].trim() : null
}

function textOf(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const attrSafe = (value: string) => value.replace(/"/g, '&quot;')

function alignFrom(style: string | null): 'start' | 'center' | 'end' {
  const value = styleValue(style, 'text-align')?.toLowerCase()
  if (value === 'center') return 'center'
  if (value === 'right' || value === 'end') return 'end'
  return 'start'
}

// <p style="text-align:center"><figure>…</figure></p>  ->  <figure data-align="center">…</figure>
function unwrapFigures(html: string): string {
  return html.replace(
    /<p\b([^>]*)>\s*((?:<figure\b[\s\S]*?<\/figure>\s*)+)<\/p>/gi,
    (_match, pAttrs: string, figures: string) => {
      const align = alignFrom(getAttr(`<p${pAttrs}>`, 'style'))
      return figures.trim().replace(/<figure\b/gi, `<figure data-align="${align}"`)
    },
  )
}

function formatFigure(attrs: string, inner: string): string {
  const open = `<figure${attrs}>`
  const imgTag = inner.match(/<img\b[^>]*>/i)?.[0]
  if (!imgTag) return `${open}${inner}</figure>`

  const src = getAttr(imgTag, 'src')
  if (!src) return `${open}${inner}</figure>`

  const alt = getAttr(imgTag, 'alt') ?? ''
  const width = getAttr(imgTag, 'width')
  const height = getAttr(imgTag, 'height')
  const authoredWidth = Number(styleValue(getAttr(open, 'style'), 'width')?.replace('px', '')) || Number(width) || 0
  const align = getAttr(open, 'data-align') ?? 'start'

  const captionHtml = inner.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i)?.[1]?.trim() ?? ''
  const caption = textOf(captionHtml)
  const label = `Ampliar imagem${caption || alt ? `: ${caption || alt}` : ''}`

  const img = `<img src="${src}" alt="${alt}"${width ? ` width="${width}"` : ''}${height ? ` height="${height}"` : ''} loading="lazy" decoding="async">`
  const style = authoredWidth > 0 ? ` style="--figure-width:${Math.round(authoredWidth)}px"` : ''

  return `<figure class="article-figure" data-align="${align}"${style}><button type="button" class="article-figure-zoom" data-zoom="" aria-label="${attrSafe(label)}">${img}<span class="article-figure-hint">${ZOOM_ICON}</span></button>${captionHtml ? `<figcaption>${captionHtml}</figcaption>` : ''}</figure>`
}

function formatCell(tag: 'td' | 'th', attrs: string, content: string, scope?: 'col'): string {
  const open = `<${tag}${attrs}>`
  const colspan = getAttr(open, 'colspan')
  const rowspan = getAttr(open, 'rowspan')
  const shaded = /background-color/i.test(getAttr(open, 'style') ?? '')
  return `<${tag}${scope ? ` scope="${scope}"` : ''}${colspan ? ` colspan="${colspan}"` : ''}${rowspan ? ` rowspan="${rowspan}"` : ''}${shaded ? ' data-shade=""' : ''}>${content}</${tag}>`
}

const CELL = /<(td|th)\b([^>]*)>([\s\S]*?)<\/\1>/gi

function formatTable(inner: string): string {
  const rows = [...inner.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1])
  if (rows.length === 0) return `<table>${inner}</table>`

  const columns = Math.max(
    ...rows.map((row) =>
      [...row.matchAll(CELL)].reduce((sum, cell) => sum + (Number(getAttr(`<td${cell[2]}>`, 'colspan')) || 1), 0),
    ),
  )
  const kind = columns >= 3 ? 'grid' : columns === 2 ? 'pairs' : 'note'

  const body = (list: string[]) =>
    list
      .map((row) => `<tr>${row.replace(CELL, (_m, _tag, attrs: string, content: string) => formatCell('td', attrs, content))}</tr>`)
      .join('')

  // Tables with 3+ columns always use the first row as column titles in our articles.
  if (kind === 'grid') {
    const head = rows[0].replace(CELL, (_m, _tag, attrs: string, content: string) => formatCell('th', attrs, content, 'col'))
    return `<div class="article-table" data-kind="grid" role="region" aria-label="Tabela" tabindex="0"><table><thead><tr>${head}</tr></thead><tbody>${body(rows.slice(1))}</tbody></table></div>`
  }

  return `<div class="article-table" data-kind="${kind}"><table><tbody>${body(rows)}</tbody></table></div>`
}

// Article and reference links open in a new tab so readers don't lose their place in the article.
// In-page anchors, e-mail and phone links keep their normal behavior.
export function openLinksInNewTab(html: string | null | undefined): string {
  if (!html) return ''
  return html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (match, attrs: string, inner: string) => {
    const href = getAttr(`<a${attrs}>`, 'href')?.trim() ?? ''
    if (!href || /^(#|mailto:|tel:|javascript:)/i.test(href)) return match
    const cleaned = attrs.replace(/\s(target|rel)\s*=\s*"[^"]*"/gi, '')
    const notice = /abre em nova aba/i.test(inner) ? '' : '<span class="sr-only"> (abre em nova aba)</span>'
    return `<a${cleaned} target="_blank" rel="noopener noreferrer">${inner}${notice}</a>`
  })
}

export function formatArticleHtml(html: string | null | undefined): string {
  if (!html) return ''
  return openLinksInNewTab(unwrapFigures(html))
    // Text pasted from Word can carry C1 control characters; U+009A is its checkbox (☐ sim ☐ não).
    .replace(/[\u0080-\u009F]/g, (ch) => (ch === '\u009A' ? '☐' : ''))
    .replace(/<figure\b([^>]*)>([\s\S]*?)<\/figure>/gi, (_m, attrs: string, inner: string) => formatFigure(attrs, inner))
    .replace(/<table\b[^>]*>([\s\S]*?)<\/table>/gi, (_m, inner: string) => formatTable(inner))
}
