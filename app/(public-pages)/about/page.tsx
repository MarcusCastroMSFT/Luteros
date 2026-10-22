import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { BrandIcon } from '@/components/brand/brand-icon';
import { PageHeader } from '@/components/common/pageHeader';
import { Button } from '@/components/ui/button';
import { aboutContent, aboutValues } from '@/data/about';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        illustration="care"
        title="Sobre a Lutteros"
        description="Ciência, prática clínica e respeito às pessoas."
        breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Sobre nós' }]}
      />

      <section aria-labelledby="about-purpose" className="relative overflow-hidden">
        <div className="relative mx-auto grid max-w-[1480px] gap-10 px-6 py-16 sm:px-10 md:grid-cols-2 md:gap-16 lg:px-12 lg:py-24">
          <div>
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.14em] text-brand-700">Nosso propósito</p>
            <h2 id="about-purpose" className="max-w-xl text-balance font-[family-name:var(--font-cardo)] text-4xl leading-[1.12] tracking-[-0.03em] text-brand-900 sm:text-5xl lg:text-6xl">
              Conhecimento para quem cuida da <span className="italic text-[#630a79]">saúde sexual.</span>
            </h2>
            <Image src="/images/brand/care-flow.svg" alt="" width={240} height={140} unoptimized className="mt-8 h-auto w-36 opacity-70 sm:w-44" />
          </div>
          <div className="self-center space-y-6 text-lg leading-[1.85] text-slate-600">
            <p className="text-xl text-brand-900 sm:text-2xl">{aboutContent.introduction}</p>
            <p>{aboutContent.purpose}</p>
            <p>{aboutContent.audience}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="about-principles" className="relative isolate overflow-hidden bg-[#e4eeeb]/65">
        <Image src="/images/brand/paper-grain.svg" alt="" fill unoptimized className="pointer-events-none -z-10 object-cover opacity-40" />
        <div className="mx-auto max-w-[1480px] px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <h2 id="about-principles" className="max-w-2xl font-[family-name:var(--font-cardo)] text-4xl leading-tight text-brand-900 sm:text-5xl">
            O que orienta a Lutteros
          </h2>
          <div className="mt-12 grid gap-12 md:grid-cols-3 md:gap-8 lg:gap-16">
            {aboutValues.map((value) => (
              <div key={value.id}>
                <BrandIcon kind={value.icon} className="mb-6 size-24 lg:size-28" />
                <h3 className="mb-4 font-[family-name:var(--font-cardo)] text-3xl leading-tight text-brand-900">{value.title}</h3>
                <p className="text-base leading-[1.85] text-slate-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="about-learning" className="mx-auto max-w-[1480px] px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
        <div className="mb-10 max-w-2xl">
          <h2 id="about-learning" className="mb-5 font-[family-name:var(--font-cardo)] text-4xl leading-tight text-brand-900 sm:text-5xl">
            Da evidência científica à prática clínica
          </h2>
          <p className="text-lg leading-[1.8] text-slate-600">Explore os conteúdos e encontre temas para aprofundar seu conhecimento em saúde sexual.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/articles" className="group rounded-[12px_40px_12px_12px] border border-brand-600/20 p-6 transition-colors hover:bg-[#e4eeeb]/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600 sm:p-10 motion-reduce:transition-none">
            <BrandIcon kind="articles" className="mb-6 size-20" />
            <h3 className="mb-4 font-[family-name:var(--font-cardo)] text-3xl text-brand-900">Artigos científicos</h3>
            <p className="mb-8 max-w-lg text-base leading-[1.8] text-slate-600">Aprofundamento teórico e contato com as evidências que fundamentam a prática clínica.</p>
            <span className="flex items-center gap-3 font-medium text-brand-700">Ler artigos <ArrowUpRight aria-hidden="true" className="size-5" /></span>
          </Link>
          <Link href="/courses" className="group rounded-[40px_12px_12px_12px] border border-[#630a79]/15 bg-[#eee5ec]/45 p-6 transition-colors hover:bg-[#eee5ec] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#630a79] sm:p-10 motion-reduce:transition-none">
            <BrandIcon kind="courses" className="mb-6 size-20" />
            <h3 className="mb-4 font-[family-name:var(--font-cardo)] text-3xl text-brand-900">Cursos e materiais educacionais</h3>
            <p className="mb-8 max-w-lg text-base leading-[1.8] text-slate-600">Conteúdos estruturados para atualização profissional e desenvolvimento de competências clínicas.</p>
            <span className="flex items-center gap-3 font-medium text-[#630a79]">Explorar cursos <ArrowUpRight aria-hidden="true" className="size-5" /></span>
          </Link>
        </div>
      </section>

      <section aria-labelledby="about-contact" className="mx-auto max-w-[1480px] px-6 pb-20 sm:px-10 lg:px-12">
        <div className="relative isolate overflow-hidden rounded-[12px_48px_12px_12px] bg-[#eee5ec] px-6 py-10 sm:p-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <Image src="/images/brand/care-bloom.svg" alt="" width={340} height={340} unoptimized className="pointer-events-none absolute -bottom-24 -right-20 -z-10 size-72 opacity-20" />
          <div className="max-w-2xl">
            <h2 id="about-contact" className="mb-4 font-[family-name:var(--font-cardo)] text-3xl text-brand-900 sm:text-4xl">Vamos conversar?</h2>
            <p className="text-base leading-[1.8] text-slate-600">Para dúvidas sobre a plataforma, conteúdos ou propostas de parceria, fale com a equipe Lutteros.</p>
          </div>
          <Button asChild className="mt-6 h-auto min-h-14 whitespace-normal bg-[#630a79] px-7 text-base shadow-none hover:bg-[#4e0860] lg:mt-0">
            <Link href="/contact">Entre em contato</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
