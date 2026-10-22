import { z } from 'zod'
import { formatBrazilianPhone, isValidBrazilianPhone } from './phone'

export const contactReasons = [
  { value: 'general', label: 'Informações Gerais' },
  { value: 'support', label: 'Suporte Técnico' },
  { value: 'courses', label: 'Dúvidas sobre Cursos' },
  { value: 'partnership', label: 'Parcerias' },
  { value: 'other', label: 'Outro' },
] as const

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome completo.').max(100, 'Use até 100 caracteres no nome.'),
  email: z.string().trim().toLowerCase().max(254).email('Informe um e-mail válido.'),
  phone: z.string().trim().max(30)
    .regex(/^[\d\s()-]*$/, 'Informe um telefone válido.')
    .transform(value => value.replace(/\D/g, ''))
    .refine(isValidBrazilianPhone, 'Informe o DDD e o telefone com 10 ou 11 dígitos.'),
  reason: z.enum(['general', 'support', 'courses', 'partnership', 'other'], { message: 'Selecione um motivo de contato.' }),
  subject: z.string().trim().max(200, 'Use até 200 caracteres no assunto.'),
  message: z.string().trim().min(10, 'Escreva uma mensagem com pelo menos 10 caracteres.').max(2000, 'Use até 2000 caracteres na mensagem.'),
})

export const contactSubmissionSchema = contactFormSchema.extend({
  submissionId: z.uuid(),
  website: z.string().max(0, 'Não foi possível validar o envio.').default(''),
})

export const contactListQuerySchema = z.object({
  page: z.coerce.number().int().min(0).max(100000).default(0),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(200).default(''),
})

export const contactRespondedSchema = z.object({ responded: z.boolean() })

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>
export type ContactReason = ContactSubmission['reason']

export function contactReasonLabel(reason: ContactReason): string {
  return contactReasons.find(item => item.value === reason)!.label
}

export function contactPhoneLabel(phone: string | null): string {
  return phone ? formatBrazilianPhone(phone) : 'Não informado'
}

export interface ContactSummary {
  id: string
  name: string
  email: string
  reason: ContactReason
  subject: string | null
  createdAt: string
  respondedAt: string | null
}
