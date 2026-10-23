import { z } from 'zod'

export type WaitlistAudience = 'general' | 'doctors'

const AUDIENCE_LABELS: Record<WaitlistAudience, string> = {
  doctors: 'Profissional de saúde',
  general: 'Outro interesse',
}

export function waitlistAudienceLabel(audience: string | null | undefined): string {
  return audience && audience in AUDIENCE_LABELS ? AUDIENCE_LABELS[audience as WaitlistAudience] : 'Não informado'
}

export const waitlistListQuerySchema = z.object({
  page: z.coerce.number().int().min(0).max(100000).default(0),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(200).default(''),
})

export interface WaitlistExportRow {
  email: string
  audience: string | null
  source: string | null
  createdAt: Date
}

// Cells starting with = + - @ are read as formulas by spreadsheets; the apostrophe keeps them as text.
function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return `"${safe.replace(/"/g, '""')}"`
}

export function waitlistToCsv(rows: WaitlistExportRow[]): string {
  const header = ['E-mail', 'Perfil', 'Origem', 'Entrou em (Brasília)'].map(csvCell).join(';')
  const lines = rows.map((row) =>
    [
      row.email,
      waitlistAudienceLabel(row.audience),
      row.source ?? '',
      row.createdAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }),
    ]
      .map(csvCell)
      .join(';'),
  )
  // The BOM makes Excel open the file as UTF-8 so accents are not garbled.
  return `\uFEFF${[header, ...lines].join('\r\n')}\r\n`
}
