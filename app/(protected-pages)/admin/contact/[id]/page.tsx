import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { getAuthUser } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { contactMessages } from '@/lib/db/schema'
import { contactPhoneLabel, contactReasonLabel } from '@/lib/contact'
import { Button } from '@/components/ui/button'
import { ContactRespondedButton } from '@/components/admin/contact-responded-button'
import { SidebarTrigger } from '@/components/ui/sidebar'

export default async function ContactMessagePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) redirect('/login?redirectTo=/admin/contact')
  if (user.role !== 'ADMIN') redirect('/admin')
  const { id } = await params
  if (!z.uuid().safeParse(id).success) notFound()
  const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1)
  if (!message) notFound()

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 lg:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" aria-label="Abrir navegação" />
        <Button asChild variant="ghost" className="-ml-3">
          <Link href="/admin/contact"><ArrowLeft className="size-4" aria-hidden="true" /> Mensagens de contato</Link>
        </Button>
      </div>
      <header>
        <p className="mb-2 text-sm font-medium text-primary">{contactReasonLabel(message.reason)}</p>
        <h1 className="break-words text-2xl font-semibold">{message.subject || 'Mensagem sem assunto'}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Recebida em {message.createdAt.toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo', dateStyle: 'long', timeStyle: 'short',
          })} (Brasília)
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <ContactRespondedButton id={message.id} responded={message.respondedAt !== null} variant="default" />
          <p className="text-sm text-muted-foreground">
            {message.respondedAt
              ? `Respondida em ${message.respondedAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })}`
              : 'Ainda sem resposta'}
          </p>
        </div>
      </header>
      <section aria-label="Dados do remetente" className="rounded-xl border bg-card p-5">
        <dl className="grid gap-5 sm:grid-cols-2">
          <div><dt className="text-sm text-muted-foreground">Nome</dt><dd className="mt-1 break-words font-medium">{message.name}</dd></div>
          <div><dt className="text-sm text-muted-foreground">Telefone</dt><dd className="mt-1">{contactPhoneLabel(message.phone)}</dd></div>
          <div className="sm:col-span-2">
            <dt className="text-sm text-muted-foreground">E-mail</dt>
            <dd className="mt-1 break-all">
              <a className="rounded text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary" href={`mailto:${encodeURIComponent(message.email)}`}>{message.email}</a>
            </dd>
          </div>
        </dl>
      </section>
      <section aria-labelledby="contact-message-body" className="rounded-xl border bg-card p-5 sm:p-7">
        <h2 id="contact-message-body" className="mb-4 text-sm font-semibold text-muted-foreground">Mensagem</h2>
        <p className="whitespace-pre-wrap break-words text-base leading-7">{message.message}</p>
      </section>
    </div>
  )
}
