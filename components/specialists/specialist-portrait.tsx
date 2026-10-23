import Image from 'next/image'
import { cn } from '@/lib/utils'

function initials(name: string): string {
  const parts = name.split(/\s+/).filter((p) => p.length > 2 || /^[A-ZÀ-Ú]/.test(p))
  return `${parts[0]?.[0] ?? ''}${parts.length > 1 ? parts[parts.length - 1][0] : ''}`.toUpperCase()
}

interface SpecialistPortraitProps {
  name: string
  image: string | null
  sizes: string
  priority?: boolean
  className?: string
}

export function SpecialistPortrait({ name, image, sizes, priority = false, className }: SpecialistPortraitProps) {
  return (
    <div className={cn('relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#e4eeeb]', className)}>
      {image ? (
        <Image
          src={image}
          alt={`Retrato de ${name}`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover object-[50%_20%]"
        />
      ) : (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center font-[family-name:var(--font-cardo)] text-6xl text-brand-700"
        >
          {initials(name)}
        </span>
      )}
    </div>
  )
}
