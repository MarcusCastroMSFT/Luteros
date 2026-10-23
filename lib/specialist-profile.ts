export type SocialKind = 'linkedin' | 'instagram' | 'twitter' | 'website'

export interface SpecialistLink {
  kind: SocialKind
  label: string
  url: string
}

const LABELS: Record<SocialKind, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  twitter: 'X (Twitter)',
  website: 'Site',
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toHttpUrl(raw: string): URL | null {
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    url.protocol = 'https:'
    return url
  } catch {
    return null
  }
}

const HANDLE = /^@?([A-Za-z0-9._]{1,30})$/

// Profiles store whatever the person typed ("@user", "linkedin.com/in/x", "instagram.com.br/x").
// Only http(s) links to the expected network are returned, so the value is safe to use as an href.
export function normalizeSocialUrl(kind: SocialKind, raw: string | null | undefined): string | null {
  const value = raw?.trim()
  if (!value) return null

  if (kind === 'instagram' || kind === 'twitter') {
    const host = kind === 'instagram' ? 'www.instagram.com' : 'x.com'
    const handle = value.match(HANDLE)
    if (handle && !/\.(com|br|org|net)$/i.test(value)) return `https://${host}/${handle[1]}`
    const url = toHttpUrl(value)
    const matches = kind === 'instagram' ? /(^|\.)instagram\.[a-z.]+$/i : /(^|\.)(twitter|x)\.com$/i
    if (!url || !matches.test(url.hostname)) return null
    const path = url.pathname.replace(/\/+$/, '')
    return path ? `https://${host}${path}` : null
  }

  const url = toHttpUrl(value)
  if (!url || !url.hostname.includes('.')) return null
  if (kind === 'linkedin' && !/(^|\.)linkedin\.com$/i.test(url.hostname)) return null
  return url.toString()
}

export function buildSpecialistLinks(profile: {
  linkedin?: string | null
  instagram?: string | null
  twitter?: string | null
  website?: string | null
}): SpecialistLink[] {
  const kinds: SocialKind[] = ['linkedin', 'instagram', 'website', 'twitter']
  return kinds.flatMap((kind) => {
    const url = normalizeSocialUrl(kind, profile[kind])
    return url ? [{ kind, label: LABELS[kind], url }] : []
  })
}

// Bios are typed one credential per line.
export function bioLines(bio: string | null | undefined): string[] {
  return (bio ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}
