import { connection } from 'next/server'
import { SITE_URL, SUPPORT_EMAIL } from '@/lib/seo'

// RFC 9116 security contact. "Expires" is regenerated yearly so the file never goes stale.
export async function GET() {
  await connection()
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

  const body = `Contact: mailto:${SUPPORT_EMAIL}
Expires: ${expires}
Preferred-Languages: pt-BR, en
Canonical: ${SITE_URL}/.well-known/security.txt
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
