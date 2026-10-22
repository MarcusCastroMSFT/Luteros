import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contactSubmissionSchema } from '@/lib/contact'
import { saveContactMessage } from '@/lib/contact-persistence'

export async function POST(request: NextRequest) {
  const text = await request.text()
  if (Buffer.byteLength(text, 'utf8') > 16000) {
    return NextResponse.json({ error: 'A mensagem excede o tamanho permitido.' }, { status: 413 })
  }
  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'Dados inválidos. Revise o formulário.' }, { status: 400 })
  }
  const parsed = contactSubmissionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  try {
    const result = await saveContactMessage(db, parsed.data)
    if (result === 'limited') {
      return NextResponse.json(
        { error: 'Limite de mensagens atingido. Tente novamente em uma hora.' },
        { status: 429, headers: { 'Retry-After': '3600' } },
      )
    }
    if (result === 'conflict') {
      return NextResponse.json({ error: 'Este envio já foi registrado com outros dados. Atualize a página para enviar uma nova mensagem.' }, { status: 409 })
    }
    return NextResponse.json({ success: true }, { status: result === 'created' ? 201 : 200 })
  } catch (error) {
    console.error('Contact message persistence failed:', error instanceof Error ? error.name : 'Unknown error')
    return NextResponse.json({ error: 'Não foi possível salvar sua mensagem. Tente novamente.' }, { status: 503 })
  }
}
