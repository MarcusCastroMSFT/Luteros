import { PageHeader } from '@/components/common/pageHeader'
import { EmptyState } from '@/components/common/empty-state'
import { SpecialistCard } from '@/components/specialists/specialist-card'
import { JsonLd } from '@/components/seo/json-ld'
import { getSpecialists, hasProfileContent } from '@/lib/specialists'
import { SITE_URL } from '@/lib/seo'
import { reveal } from '@/lib/motion'

export default async function SpecialistsPage() {
  const specialists = await getSpecialists()

  return (
    <div className="min-h-screen bg-background">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': `${SITE_URL}/specialists`,
          url: `${SITE_URL}/specialists`,
          name: 'Especialistas em saúde sexual | Lutteros',
          inLanguage: 'pt-BR',
          isPartOf: { '@id': `${SITE_URL}/#website` },
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: specialists.map((s, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: s.name,
              ...(hasProfileContent(s) && { url: `${SITE_URL}/specialists/${s.slug}` }),
            })),
          },
        }}
      />

      <PageHeader
        illustration="care"
        title="Especialistas"
        description="Conheça os profissionais que formam o time de especialistas da Lutteros."
        breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Especialistas' }]}
      />

      <section aria-label="Lista de especialistas">
        <div className="mx-auto max-w-[1480px] px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          {specialists.length > 0 ? (
            <ul data-reveal-stagger="" suppressHydrationWarning className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {specialists.map((specialist) => (
                <li key={specialist.id}>
                  <SpecialistCard specialist={specialist} />
                </li>
              ))}
            </ul>
          ) : (
            <div {...reveal()}>
              <EmptyState
                variant="specialists"
                title="Em breve"
                description="Estamos preparando os perfis do nosso time de especialistas."
              />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
