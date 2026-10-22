import Link from 'next/link'
import { desc, sql } from 'drizzle-orm'
import { ArrowRight, CheckCircle2, Inbox } from 'lucide-react'
import { ContactRespondedButton } from '@/components/admin/contact-responded-button'
import { db } from '@/lib/db'
import { contactMessages } from '@/lib/db/schema'
import { contactReasonLabel, type ContactReason } from '@/lib/contact'
import { cn } from '@/lib/utils'

export interface RecentContactMessage {
  id: string
  name: string
  reason: ContactReason
  subject: string | null
  preview: string
  createdAt: Date
  respondedAt: Date | null
}

const dateFormat = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })

export function ContactMessagesPanel({ messages, unanswered, error = false }: { messages: RecentContactMessage[]; unanswered: number; error?: boolean }) {
  return (
    <section aria-labelledby="recent-contact-title" className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-4 border-b border-gray-100 p-5">
        <div>
          <h2 id="recent-contact-title" className="text-base font-semibold text-gray-900">Mensagens de contato</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            {unanswered > 0 ? `${unanswered} ${unanswered === 1 ? 'mensagem sem resposta' : 'mensagens sem resposta'}` : 'Todas as mensagens foram respondidas'}
          </p>
        </div>
        <Link href="/admin/contact" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          Ver todas <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </header>

      {error ? (
        <p role="alert" className="p-6 text-sm text-destructive">Não foi possível carregar as mensagens. Atualize a página para tentar de novo.</p>
      ) : messages.length === 0 ? (
        <div className="p-8 text-center">
          <Inbox className="mx-auto mb-2 h-10 w-10 text-gray-300" aria-hidden="true" />
          <p className="text-sm text-gray-500">Nenhuma mensagem recebida ainda</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {messages.map((message) => {
            const responded = message.respondedAt !== null
            return (
              <li key={message.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="font-medium text-gray-900">{message.name}</p>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                        responded ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
                      )}
                    >
                      {responded && <CheckCircle2 className="h-3 w-3" aria-hidden="true" />}
                      {responded ? 'Respondida' : 'Sem resposta'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {contactReasonLabel(message.reason)} · {dateFormat.format(message.createdAt)}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                    {message.subject ? <span className="font-medium text-gray-800">{message.subject}. </span> : null}
                    {message.preview}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/contact/${message.id}`}
                    aria-label={`Ler mensagem de ${message.name}`}
                    className="inline-flex h-8 items-center rounded-md border border-gray-200 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    Ler
                  </Link>
                  <ContactRespondedButton id={message.id} responded={responded} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export async function RecentContactMessages() {
  let result: { messages: RecentContactMessage[]; unanswered: number } | null = null
  try {
    const [[{ unanswered }], rows] = await db.batch([
      db.select({ unanswered: sql<number>`count(*) filter (where ${contactMessages.respondedAt} is null)::int` }).from(contactMessages),
      db.select({
        id: contactMessages.id,
        name: contactMessages.name,
        reason: contactMessages.reason,
        subject: contactMessages.subject,
        preview: sql<string>`left(${contactMessages.message}, 160)`,
        createdAt: contactMessages.createdAt,
        respondedAt: contactMessages.respondedAt,
      }).from(contactMessages).orderBy(desc(contactMessages.createdAt), desc(contactMessages.id)).limit(3),
    ])
    result = { messages: rows, unanswered }
  } catch (error) {
    console.error('Recent contact messages query failed:', error instanceof Error ? error.name : 'Unknown error')
  }
  return result
    ? <ContactMessagesPanel messages={result.messages} unanswered={result.unanswered} />
    : <ContactMessagesPanel messages={[]} unanswered={0} error />
}
