import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BrandIcon } from '@/components/brand/brand-icon';
import { PageHeader } from '@/components/common/pageHeader';
import { Button } from '@/components/ui/button';
import { aboutContent, aboutValues } from '@/data/about';

const contentLinks = [
  {
    href: '/articles',
    icon: 'articles',
    title: 'Artigos científicos',
    description: 'Aprofundamento teórico e contato com as evidências que fundamentam a prática clínica.',
    action: 'Ler artigos',
  },
  {
    href: '/courses',
    icon: 'courses',
    title: 'Cursos e materiais educacionais',
    description: 'Conteúdos estruturados para atualização profissional e desenvolvimento de competências clínicas.',
    action: 'Explorar cursos',
  },
] as const;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        illustration="care"
        title="Sobre a Lutteros"
        description="Ciência, prática clínica e respeito às pessoas."
        breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Sobre nós' }]}
      />

      <section aria-labelledby="about-purpose">
        <div className="mx-auto grid max-w-[1480px] items-center gap-10 px-6 py-16 sm:px-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:px-12 lg:py-24">
          <div>
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.14em] text-brand-700">Nosso propósito</p>
            <h2 id="about-purpose" className="max-w-xl text-balance font-[family-name:var(--font-cardo)] text-4xl leading-[1.12] tracking-[-0.03em] text-brand-900 sm:text-5xl lg:text-6xl">
              Conhecimento para quem cuida da <span className="italic text-brand-600">saúde sexual.</span>
            </h2>
            <div className="mt-8 space-y-5 text-lg leading-[1.85] text-slate-600">
              <p className="text-xl text-brand-900">{aboutContent.introduction}</p>
              <p>{aboutContent.purpose}</p>
              <p>{aboutContent.audience}</p>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#e4eeeb] shadow-[0_24px_60px_-36px_rgba(5,38,40,0.5)]">
            <Image
              src="/images/about/evidence.webp"
              alt="Duas pessoas profissionais de saúde analisando juntas um artigo científico em uma mesa de trabalho."
              fill
              sizes="(min-width: 1480px) 700px, (min-width: 1024px) 48vw, calc(100vw - 48px)"
              className="object-cover object-[50%_40%]"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="about-principles" className="bg-[#e4eeeb]/70">
        <div className="mx-auto max-w-[1480px] px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <h2 id="about-principles" className="max-w-2xl font-[family-name:var(--font-cardo)] text-4xl leading-tight text-brand-900 sm:text-5xl">
            O que orienta a Lutteros
          </h2>
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {aboutValues.map((value) => (
              <li key={value.id} className="rounded-xl border border-brand-900/10 bg-[#faf9f6] p-6 lg:p-7">
                <BrandIcon kind={value.icon} className="mb-5 size-16" />
                <h3 className="mb-3 text-xl font-semibold text-brand-900">{value.title}</h3>
                <p className="text-base leading-[1.75] text-slate-600">{value.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="about-learning">
        <div className="mx-auto grid max-w-[1480px] items-center gap-10 px-6 py-16 sm:px-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-12 lg:py-24">
          <div className="relative order-2 aspect-[4/3] overflow-hidden rounded-2xl bg-[#e4eeeb] shadow-[0_24px_60px_-36px_rgba(5,38,40,0.5)] lg:order-1">
            <Image
              src="/images/about/study.webp"
              alt="Mesa de estudo com uma revista científica aberta, caderno de anotações, caneta e uma xícara de chá."
              fill
              sizes="(min-width: 1480px) 700px, (min-width: 1024px) 50vw, calc(100vw - 48px)"
              className="object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <h2 id="about-learning" className="mb-5 max-w-xl text-balance font-[family-name:var(--font-cardo)] text-4xl leading-tight text-brand-900 sm:text-5xl">
              Da evidência científica à prática clínica
            </h2>
            <p className="mb-8 max-w-xl text-lg leading-[1.8] text-slate-600">
              Explore os conteúdos e encontre temas para aprofundar seu conhecimento em saúde sexual.
            </p>
            <ul className="divide-y divide-brand-900/10 border-y border-brand-900/10">
              {contentLinks.map(({ href, icon, title, description, action }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex items-start gap-5 py-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
                  >
                    <BrandIcon kind={icon} className="size-16 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="mb-2 block text-xl font-semibold text-brand-900">{title}</span>
                      <span className="mb-3 block text-base leading-[1.7] text-slate-600">{description}</span>
                      <span className="inline-flex items-center gap-2 font-medium text-brand-700">
                        {action}
                        <ArrowRight aria-hidden="true" className="size-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="about-contact" className="mx-auto max-w-[1480px] px-6 pb-20 sm:px-10 lg:px-12">
        <div className="grid overflow-hidden rounded-2xl bg-[#0a2f33] text-[#fbf8f3] lg:grid-cols-[1fr_1.1fr]">
          <div className="relative min-h-64 lg:min-h-[360px]">
            <Image
              src="/images/about/room.webp"
              alt="Sala de atendimento com duas poltronas frente a frente, plantas e luz natural."
              fill
              sizes="(min-width: 1480px) 640px, (min-width: 1024px) 45vw, calc(100vw - 48px)"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-10 sm:p-12 lg:p-14">
            <h2 id="about-contact" className="mb-4 font-[family-name:var(--font-cardo)] text-3xl sm:text-4xl">Vamos conversar?</h2>
            <p className="max-w-lg text-base leading-[1.8] text-[#fbf8f3]/85">
              Para dúvidas sobre a plataforma, conteúdos ou propostas de parceria, fale com a equipe Lutteros.
            </p>
            <Button asChild className="mt-8 h-auto min-h-14 w-full whitespace-normal bg-[#faf9f6] px-7 text-base font-semibold text-brand-900 shadow-none hover:bg-white sm:w-fit">
              <Link href="/contact">Entre em contato</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
