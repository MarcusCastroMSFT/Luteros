import { connection, NextRequest, NextResponse } from 'next/server'
import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { contactMessages } from '@/lib/db/schema'
import { contactRespondedSchema } from '@/lib/contact'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connection()
  try {
    const access = await requireAdmin(request)
    if (access instanceof NextResponse) return access

    const { id } = await params
    if (!z.uuid().safeParse(id).success) {
      return NextResponse.json({ error: 'Mensagem não encontrada.' }, { status: 404 })
    }
    const parsed = contactRespondedSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Informe se a mensagem foi respondida.' }, { status: 400 })
    }

    // Marking an already answered message keeps its original answer date.
    const [updated] = await db.update(contactMessages)
      .set({ respondedAt: parsed.data.responded ? sql`coalesce(${contactMessages.respondedAt}, now())` : null })
      .where(eq(contactMessages.id, id))
      .returning({ id: contactMessages.id, respondedAt: contactMessages.respondedAt })
    if (!updated) {
      return NextResponse.json({ error: 'Mensagem não encontrada.' }, { status: 404 })
    }
    return NextResponse.json(updated, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    console.error('Contact status update failed:', error instanceof Error ? error.name : 'Unknown error')
    return NextResponse.json({ error: 'Não foi possível atualizar a mensagem.' }, { status: 500 })
  }
}
