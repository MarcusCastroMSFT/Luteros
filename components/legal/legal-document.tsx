import type { ReactNode } from 'react'
import { ChevronDown, type LucideIcon } from 'lucide-react'
import { DocToc, type DocSection } from './doc-toc'

interface LegalDocumentProps {
  eyebrow: string
  eyebrowIcon: LucideIcon
  title: string
  intro: string
  lastUpdated: string
  sections: DocSection[]
  children: ReactNode
}

export function LegalDocument({ eyebrow, eyebrowIcon: Icon, title, intro, lastUpdated, sections, children }: LegalDocumentProps) {
  return (
    <div className="bg-[#faf8f4] text-[#0a2f33]">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/10 bg-[#052628] text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:48px_48px]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-32 size-[28rem] rounded-full bg-[#630a79]/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 left-1/4 size-[26rem] rounded-full bg-[#198189]/30 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#7fd3d8]">
              <Icon className="size-5" aria-hidden="true" />
              {eyebrow}
            </div>
            <h1 className="mt-7 font-[family-name:var(--font-cardo)] text-[clamp(2.75rem,6vw,4.75rem)] font-normal leading-[1.04] text-white">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">{intro}</p>
            <p className="mt-8 border-l-2 border-[#7fd3d8] pl-4 text-sm text-white/60">
              Última atualização: {lastUpdated}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="lg:grid lg:grid-cols-[260px_minmax(0,820px)] lg:justify-between lg:gap-14 xl:gap-20">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <DocToc sections={sections} />
            </div>
          </aside>

          <div>
            <details className="group mb-10 rounded-xl border border-[#0a2f33]/12 bg-white/60 lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-[#0a2f33]">
                Neste documento
                <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <nav aria-label="Neste documento" className="border-t border-[#0a2f33]/10 px-2 py-2">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block rounded-lg px-3 py-2 text-sm text-[#4f666a] transition-colors hover:bg-[#198189]/10 hover:text-[#0a2f33]"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </details>

            <article className="space-y-14 text-base leading-8 text-[#3d5559]">{children}</article>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LegalSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-b border-[#0a2f33]/10 pb-14 last:border-b-0 last:pb-0">
      <h2 className="mb-5 font-[family-name:var(--font-cardo)] text-[1.9rem] font-normal leading-tight text-[#0a2f33]">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

export function LegalSub({ children }: { children: ReactNode }) {
  return <h3 className="pt-3 text-lg font-semibold text-[#0a2f33]">{children}</h3>
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2.5 pl-6 marker:text-[#198189]">{children}</ul>
}

export function LegalCallout({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <aside className="rounded-xl border border-[#198189]/20 border-l-4 border-l-[#198189] bg-[#198189]/[0.06] px-5 py-4 text-[0.95rem] leading-7 text-[#0a2f33]">
      {title ? <p className="mb-1 font-semibold">{title}</p> : null}
      <div className="space-y-2">{children}</div>
    </aside>
  )
}

export function LegalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="-mx-1 rounded px-1 font-medium text-[#146b71] transition-colors duration-200 hover:bg-[#198189]/10 hover:text-[#630a79]"
    >
      {children}
    </a>
  )
}
