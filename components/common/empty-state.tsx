import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BrandIcon, type BrandIconName } from '@/components/brand/brand-icon'
import { cn } from '@/lib/utils'

export type EmptyStateVariant = 'search' | 'events' | 'products' | 'articles' | 'courses' | 'specialists' | 'default'

interface EmptyStateAction {
  label: string
  href?: string
  onClick?: () => void
  variant?: 'default' | 'outline'
}

interface EmptyStateProps {
  variant?: EmptyStateVariant
  title: string
  description?: string
  action?: EmptyStateAction
  secondaryAction?: EmptyStateAction
  className?: string
  size?: 'sm' | 'md'
}

const illustrations: Record<EmptyStateVariant, BrandIconName> = {
  search: 'search',
  events: 'events',
  products: 'products',
  articles: 'articles',
  courses: 'courses',
  specialists: 'care',
  default: 'sprout',
}

function ActionButton({ action }: { action: EmptyStateAction }) {
  const outline = action.variant === 'outline'
  return (
    <Button
      asChild={Boolean(action.href)}
      variant={action.variant ?? 'default'}
      onClick={action.onClick}
      className={cn(
        'min-h-12 h-auto max-w-full cursor-pointer whitespace-normal rounded-md px-6 py-3 text-base shadow-none focus-visible:ring-offset-4 motion-reduce:transition-none',
        outline ? 'border-brand-600/30 bg-transparent text-brand-700 hover:bg-brand-50' : 'bg-brand-600 text-white hover:bg-brand-700',
      )}
    >
      {action.href ? <Link href={action.href}>{action.label}</Link> : action.label}
    </Button>
  )
}

export function EmptyState({ variant = 'default', title, description, action, secondaryAction, className, size = 'md' }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', size === 'md' ? 'px-4 py-16 sm:py-20' : 'px-4 py-10', className)}>
      <BrandIcon kind={illustrations[variant]} className={cn('mb-7', size === 'md' ? 'size-36 sm:size-44' : 'size-28')} />
      <h3 className={cn('mb-4 max-w-xl text-balance font-[family-name:var(--font-cardo)] leading-tight text-brand-900', size === 'md' ? 'text-3xl sm:text-4xl' : 'text-2xl')}>
        {title}
      </h3>
      {description && <p className="mb-7 max-w-lg text-base leading-[1.8] text-slate-600">{description}</p>}
      {(action || secondaryAction) && (
        <div className="flex w-full flex-wrap items-center justify-center gap-3">
          {action && <ActionButton action={action} />}
          {secondaryAction && <ActionButton action={{ variant: 'outline', ...secondaryAction }} />}
        </div>
      )}
    </div>
  )
}
