import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ExternalLink, Leaf } from 'lucide-react'
import { DisplayHeading } from '@/components/common/display-heading'
import { JsonLd } from '@/components/seo/json-ld'
import { SpecialistPortrait } from '@/components/specialists/specialist-portrait'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { getSpecialistBySlug, getSpecialists, hasProfileContent } from '@/lib/specialists'
import { SITE_URL, truncateMeta } from '@/lib/seo'
import { enterDelay, reveal } from '@/lib/motion'

interface SpecialistPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const specialists = await getSpecialists()
  return specialists.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: SpecialistPageProps): Promise<Metadata> {
  const { slug } = await params
  const specialist = await getSpecialistBySlug(slug)
  if (!specialist) return { title: 'Especialista não encontrado', robots: { index: false, follow: false } }

  const roleLine = [specialist.title, specialist.company].filter(Boolean).join(' · ')
  const description = truncateMeta(
    specialist.credentials.length > 0
      ? `${roleLine ? `${roleLine}. ` : ''}${specialist.credentials.join(' ')}`
      : `${specialist.name}, especialista da Lutteros.`,
  )
  const url = `/specialists/${specialist.slug}`

  return {
    title: roleLine ? `${specialist.name} — ${specialist.title ?? roleLine}` : specialist.name,
    description,
    alternates: { canonical: url },
    // Thin profiles (no bio yet) stay reachable but out of search results.
    robots: hasProfileContent(specialist) ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      type: 'profile',
      url,
      title: `${specialist.name} | lutteros`,
      description,
      ...(specialist.image && { images: [{ url: specialist.image, alt: `Retrato de ${specialist.name}` }] }),
    },
  }
}

export default async function SpecialistPage({ params }: SpecialistPageProps) {
  const { slug } = await params
  const specialist = await getSpecialistBySlug(slug)
  if (!specialist) notFound()

  const url = `${SITE_URL}/specialists/${specialist.slug}`
  const roleLine = specialist.title ?? 'Especialista Lutteros'

  return (
    <div className="min-h-screen bg-background">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'ProfilePage',
            '@id': `${url}#profile`,
            url,
            inLanguage: 'pt-BR',
            isPartOf: { '@id': `${SITE_URL}/#website` },
            mainEntity: {
              '@type': 'Person',
              '@id': `${url}#person`,
              name: specialist.name,
              url,
              image: specialist.image ?? undefined,
              jobTitle: specialist.title ?? undefined,
              description: specialist.credentials.length > 0 ? truncateMeta(specialist.credentials.join('. '), 300) : undefined,
              affiliation: specialist.company ? { '@type': 'Organization', name: specialist.company } : undefined,
              sameAs: specialist.links.length > 0 ? specialist.links.map((l) => l.url) : undefined,
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Especialistas', item: `${SITE_URL}/specialists` },
              { '@type': 'ListItem', position: 3, name: specialist.name, item: url },
            ],
          },
        ]}
      />

      <section className="relative isolate overflow-hidden py-8 md:py-12 lg:py-16">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[url('/images/brand/paper-grain.svg')]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-48 -top-64 hidden size-[640px] rounded-[42%_58%_38%_62%] bg-[#e4eeeb] md:block" />

        <div className="relative mx-auto max-w-[1480px] px-6 sm:px-10 lg:px-12">
          <Breadcrumb className="hero-enter mb-8 justify-start">
            <BreadcrumbList className="justify-start">
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-sm text-gray-600 hover:text-primary md:text-base">Início</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/specialists" className="text-sm text-gray-600 hover:text-primary md:text-base">Especialistas</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium text-gray-900 md:text-base">{specialist.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid items-start gap-10 md:grid-cols-[minmax(0,340px)_1fr] lg:gap-16">
            <div style={enterDelay(120)} className="hero-photo mx-auto w-full max-w-[340px] md:mx-0">
              <SpecialistPortrait
                name={specialist.name}
                image={specialist.image}
                priority
                sizes="(min-width: 768px) 340px, 80vw"
                className="shadow-[0_24px_60px_-36px_rgba(5,38,40,0.5)]"
              />
            </div>

            <div>
              <p style={enterDelay(80)} className="hero-enter mb-4 text-sm font-medium uppercase tracking-[0.14em] text-brand-700">
                {roleLine}
              </p>
              <DisplayHeading size="lg" style={enterDelay(160)} className="hero-rise max-w-3xl text-balance font-normal tracking-[-0.03em] text-brand-900">
                {specialist.name}
              </DisplayHeading>
              {specialist.company && (
                <p style={enterDelay(240)} className="hero-enter mt-4 text-lg text-slate-600">{specialist.company}</p>
              )}

              {specialist.links.length > 0 && (
                <ul style={enterDelay(320)} className="hero-enter mt-8 flex flex-wrap gap-3" aria-label={`Links de ${specialist.name}`}>
                  {specialist.links.map((link) => (
                    <li key={link.kind}>
                      <Button asChild variant="outline" className="border-brand-900/20 text-brand-900">
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          {link.label}
                          <ExternalLink aria-hidden="true" className="size-4" />
                          <span className="sr-only"> (abre em nova aba)</span>
                        </a>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              {specialist.credentials.length > 0 ? (
                <div {...reveal()} className="mt-12">
                  <h2 className="mb-5 font-[family-name:var(--font-cardo)] text-3xl text-brand-900">Formação e atuação</h2>
                  <ul className="divide-y divide-brand-900/10 border-y border-brand-900/10">
                    {specialist.credentials.map((line) => (
                      <li key={line} className="flex items-start gap-4 py-4 text-lg leading-[1.7] text-slate-700">
                        <Leaf aria-hidden="true" className="mt-1.5 size-4 shrink-0 text-brand-600" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p {...reveal()} className="mt-10 max-w-xl text-lg leading-[1.8] text-slate-600">
                  O perfil completo será publicado em breve.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {specialist.courses.length > 0 && (
        <section aria-labelledby="specialist-courses" className="bg-[#e4eeeb]/70">
          <div className="mx-auto max-w-[1480px] px-6 py-16 sm:px-10 lg:px-12 lg:py-20">
            <h2 id="specialist-courses" {...reveal()} className="mb-10 font-[family-name:var(--font-cardo)] text-4xl text-brand-900">
              Cursos com {specialist.name.split(' ')[0]}
            </h2>
            <ul data-reveal-stagger="" suppressHydrationWarning className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {specialist.courses.map((course) => (
                <li key={course.slug}>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="group block h-full rounded-xl border border-brand-900/10 bg-[#faf9f6] p-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
                  >
                    <h3 className="mb-2 text-xl font-semibold text-brand-900">{course.title}</h3>
                    <p className="mb-4 line-clamp-3 text-base leading-[1.7] text-slate-600">{course.description}</p>
                    <span className="inline-flex items-center gap-2 font-medium text-brand-700">
                      Ver curso
                      <ArrowRight aria-hidden="true" className="size-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}
