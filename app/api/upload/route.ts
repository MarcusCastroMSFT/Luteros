import { NextRequest, NextResponse, connection } from 'next/server'
import { put } from '@vercel/blob'
import { requireAdminOrInstructor } from '@/lib/auth-helpers'

const MAX_BYTES = 8 * 1024 * 1024 // 8 MB hard ceiling on uploads
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])

export async function POST(request: NextRequest) {
  await connection()

  const authResult = await requireAdminOrInstructor(request)
  if (authResult instanceof NextResponse) return authResult

  try {
    const form = await request.formData()
    const file = form.get('file')
    const folder = (form.get('folder') as string | null) || 'uploads'

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'Missing "file" field' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Arquivo muito grande (máximo 8MB)' }, { status: 413 })
    }
    if (file.type && !ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: `Tipo de arquivo não suportado: ${file.type}` }, { status: 415 })
    }

    // Pull a sensible extension from the MIME type
    const extensionFromType = (file.type || '').split('/')[1] || 'bin'
    const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, '').slice(0, 60) || 'uploads'
    const filename = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensionFromType}`

    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type || 'application/octet-stream',
      // addRandomSuffix is already implicit in our filename randomness
      addRandomSuffix: false,
      // Cache the blob aggressively at the CDN edge
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    })

    return NextResponse.json({ url: blob.url, pathname: blob.pathname })
  } catch (error) {
    console.error('Upload error:', error)
    const message = error instanceof Error ? error.message : 'Falha ao enviar arquivo'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
