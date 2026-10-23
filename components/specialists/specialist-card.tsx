import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { hasProfileContent, type Specialist } from '@/lib/specialists'
import { SpecialistPortrait } from '@/components/specialists/specialist-portrait'

export function SpecialistCard({ specialist }: { specialist: Specialist }) {
  const linked = hasProfileContent(specialist)
  const affiliation = [specialist.title, specialist.company].filter(Boolean).join(' · ')

  const content = (
    <>
      <SpecialistPortrait
        name={specialist.name}
        image={specialist.image}
        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, calc(100vw - 48px)"
        className="shadow-[0_24px_60px_-36px_rgba(5,38,40,0.5)] motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:-translate-y-1"
      />
      <div className="pt-6">
        <h2 className="font-[family-name:var(--font-cardo)] text-3xl leading-tight text-brand-900">{specialist.name}</h2>
        <p className="mt-2 text-base text-brand-700">{affiliation || 'Especialista Lutteros'}</p>
        {linked && (
          <>
            <p className="mt-3 line-clamp-3 text-base leading-[1.75] text-slate-600">{specialist.credentials.join(' · ')}</p>
            <span className="mt-4 inline-flex items-center gap-2 font-medium text-brand-700">
              Ver perfil
              <ArrowRight aria-hidden="true" className="size-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" />
            </span>
          </>
        )}
      </div>
    </>
  )

  return linked ? (
    <Link
      href={`/specialists/${specialist.slug}`}
      aria-label={`Ver perfil de ${specialist.name}`}
      className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
    >
      {content}
    </Link>
  ) : (
    <div>{content}</div>
  )
}
