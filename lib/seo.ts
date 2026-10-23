import { LUTTEROS_ENTITY } from './legal-entity'

// Canonical origin for absolute URLs outside the root layout (feeds, llms.txt, sitemap...).
export const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || LUTTEROS_ENTITY.siteUrl).replace(/\/$/, '')

export const SITE_NAME = 'Lutteros'
export const SITE_TAGLINE = 'Saúde sexual baseada em conhecimento científico'
export const SUPPORT_EMAIL = LUTTEROS_ENTITY.contactEmail

export function absoluteUrl(pathOrUrl: string): string {
  return /^https?:\/\//i.test(pathOrUrl) ? pathOrUrl : `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

export function stripHtml(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

// Search engines cut meta descriptions around 155-160 characters; trim on a word boundary.
export function truncateMeta(text: string | null | undefined, max = 160): string {
  const clean = stripHtml(text ?? '')
  if (clean.length <= max) return clean
  const slice = clean.slice(0, max - 1)
  const lastSpace = slice.lastIndexOf(' ')
  const cut = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice
  return `${cut.replace(/[\s,;:.\-–—]+$/, '')}…`
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
