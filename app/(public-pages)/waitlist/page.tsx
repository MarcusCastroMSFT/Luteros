import type { Metadata } from 'next';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { PageHeader } from '@/components/common/pageHeader';
import { WaitlistForm } from '@/components/waitlist/waitlist-form';
import { reveal } from '@/lib/motion';

export const metadata: Metadata = {
  title: 'Lista de espera da assinatura',
  description: 'Alguns artigos da Lutteros são de acesso pago. Entre na lista de espera e receba um e-mail quando a assinatura estiver disponível.',
  alternates: { canonical: '/waitlist' },
};

const steps = [
  'Você deixa seu e-mail. Não há cobrança nem compromisso.',
  'Quando a assinatura abrir, avisamos você por e-mail.',
  'Os artigos gratuitos e os cursos continuam disponíveis enquanto isso.',
];

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        illustration="articles"
        title="Assinatura de conteúdos"
        description="Estamos preparando a assinatura para os artigos de acesso pago."
        breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Assinatura' }]}
      />

      <section aria-labelledby="waitlist-heading">
        <div className="mx-auto grid max-w-[1480px] items-start gap-10 px-6 pb-20 pt-4 sm:px-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:px-12 lg:pb-28">
          <div data-reveal="" suppressHydrationWarning>
            <h2 id="waitlist-heading" className="sr-only">Lista de espera</h2>
            <WaitlistForm />
          </div>

          <div data-reveal="" suppressHydrationWarning style={reveal(1, 140).style}>
            <div className="relative mb-8 aspect-[4/3] overflow-hidden rounded-2xl bg-[#e4eeeb] shadow-[0_24px_60px_-36px_rgba(5,38,40,0.5)]">
              <Image
                src="/images/about/study.webp"
                alt="Mesa de estudo com uma revista científica aberta, caderno de anotações, caneta e uma xícara de chá."
                fill
                sizes="(min-width: 1480px) 640px, (min-width: 1024px) 45vw, calc(100vw - 48px)"
                className="object-cover"
              />
            </div>
            <h3 className="mb-5 font-[family-name:var(--font-cardo)] text-3xl text-brand-900">Como funciona</h3>
            <ul className="space-y-4">
              {steps.map((step) => (
                <li key={step} className="flex items-start gap-3 text-base leading-[1.7] text-slate-600">
                  <span aria-hidden="true" className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#e4eeeb] text-brand-700">
                    <Check className="size-4" />
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
