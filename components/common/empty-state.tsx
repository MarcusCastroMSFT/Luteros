import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type EmptyStateVariant =
  | 'search'
  | 'events'
  | 'products'
  | 'articles'
  | 'courses'
  | 'specialists'
  | 'default'

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

// Shared brand palette for the illustrations
const C = {
  primary: '#198189',
  deep: '#0f5a5f',
  fill: '#e3f1f1',
  fillDeep: '#cfe8e8',
  accent: '#e27447',
  line: '#adc3c3',
  paper: '#ffffff',
}

function ActionButton({ action }: { action: EmptyStateAction }) {
  const btn = (
    <Button
      variant={action.variant ?? 'default'}
      onClick={action.onClick}
      className="cursor-pointer"
    >
      {action.label}
    </Button>
  )
  return action.href ? <Link href={action.href}>{btn}</Link> : btn
}

/**
 * A polished, reusable empty-state with cohesive brand illustrations.
 * Server-compatible; pass `onClick` actions only from client components.
 */
export function EmptyState({
  variant = 'default',
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        size === 'md' ? 'py-16 px-4' : 'py-10 px-4',
        className,
      )}
    >
      <EmptyIllustration
        variant={variant}
        className={cn(size === 'md' ? 'w-56 h-44' : 'w-44 h-36', 'mb-6')}
      />
      <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm md:text-base text-gray-500 max-w-md mb-6">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action && <ActionButton action={action} />}
          {secondaryAction && <ActionButton action={{ variant: 'outline', ...secondaryAction }} />}
        </div>
      )}
    </div>
  )
}

function EmptyIllustration({
  variant,
  className,
}: {
  variant: EmptyStateVariant
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 220 180"
      className={className}
      role="img"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="es-panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.paper} />
          <stop offset="100%" stopColor={C.fill} />
        </linearGradient>
        <radialGradient id="es-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={C.primary} stopOpacity="0.18" />
          <stop offset="100%" stopColor={C.primary} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft background glow */}
      <circle cx="110" cy="84" r="78" fill="url(#es-glow)" />

      {/* Floating decorative dots */}
      <circle cx="40" cy="46" r="5" fill={C.primary} opacity="0.25" />
      <circle cx="182" cy="52" r="7" fill={C.accent} opacity="0.35" />
      <circle cx="176" cy="120" r="4" fill={C.primary} opacity="0.3" />
      <circle cx="46" cy="120" r="6" fill={C.fillDeep} />

      {/* Ground shadow */}
      <ellipse cx="110" cy="150" rx="66" ry="9" fill={C.primary} opacity="0.08" />

      {/* Floating glyph */}
      <g className="es-float">
        <Glyph variant={variant} />
      </g>
    </svg>
  )
}

function Glyph({ variant }: { variant: EmptyStateVariant }) {
  switch (variant) {
    case 'events':
      return (
        <g>
          <rect x="66" y="46" width="88" height="80" rx="12" fill="url(#es-panel)" stroke={C.line} strokeWidth="2" />
          <rect x="66" y="46" width="88" height="22" rx="12" fill={C.primary} />
          <rect x="66" y="60" width="88" height="8" fill={C.primary} />
          <circle cx="88" cy="44" r="5" fill={C.deep} />
          <circle cx="132" cy="44" r="5" fill={C.deep} />
          <g fill={C.line}>
            <circle cx="84" cy="86" r="4" /><circle cx="104" cy="86" r="4" /><circle cx="124" cy="86" r="4" />
            <circle cx="84" cy="104" r="4" /><circle cx="104" cy="104" r="4" />
          </g>
          <circle cx="128" cy="104" r="9" fill={C.accent} />
          <path d="M124.5 104l2.5 2.5 4.5-5" stroke={C.paper} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )
    case 'products':
      return (
        <g>
          <path d="M74 74l36-16 36 16v34a6 6 0 0 1-3.4 5.4L110 128l-32.6-14.6A6 6 0 0 1 74 108z" fill="url(#es-panel)" stroke={C.line} strokeWidth="2" strokeLinejoin="round" />
          <path d="M74 74l36 16 36-16" fill="none" stroke={C.line} strokeWidth="2" strokeLinejoin="round" />
          <path d="M110 90v38" stroke={C.line} strokeWidth="2" />
          <path d="M92 66l36 16" stroke={C.primary} strokeWidth="2" opacity="0.5" />
          <circle cx="132" cy="70" r="10" fill={C.accent} />
          <path d="M132 65v10M127 70h10" stroke={C.paper} strokeWidth="2" strokeLinecap="round" />
        </g>
      )
    case 'articles':
      return (
        <g>
          <rect x="72" y="52" width="72" height="88" rx="8" fill={C.fillDeep} transform="rotate(-6 108 96)" />
          <rect x="78" y="48" width="76" height="90" rx="8" fill="url(#es-panel)" stroke={C.line} strokeWidth="2" />
          <g stroke={C.line} strokeWidth="3" strokeLinecap="round">
            <path d="M90 68h52" /><path d="M90 82h52" /><path d="M90 96h40" /><path d="M90 110h48" />
          </g>
          <circle cx="140" cy="120" r="12" fill={C.primary} />
          <path d="M135 120l3.5 3.5L146 116" stroke={C.paper} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )
    case 'courses':
      return (
        <g>
          <rect x="64" y="52" width="92" height="60" rx="8" fill="url(#es-panel)" stroke={C.line} strokeWidth="2" />
          <rect x="98" y="112" width="24" height="10" fill={C.line} />
          <rect x="84" y="122" width="52" height="6" rx="3" fill={C.line} />
          <circle cx="110" cy="82" r="18" fill={C.primary} />
          <path d="M104 74l14 8-14 8z" fill={C.paper} />
          <path d="M150 58l16 7-16 7-16-7z" fill={C.accent} />
          <path d="M166 65v9" stroke={C.accent} strokeWidth="2" strokeLinecap="round" />
        </g>
      )
    case 'specialists':
      return (
        <g>
          <rect x="66" y="50" width="88" height="80" rx="12" fill="url(#es-panel)" stroke={C.line} strokeWidth="2" />
          <circle cx="92" cy="82" r="14" fill={C.fillDeep} />
          <circle cx="92" cy="77" r="6" fill={C.primary} />
          <path d="M80 96a12 12 0 0 1 24 0z" fill={C.primary} />
          <g stroke={C.line} strokeWidth="4" strokeLinecap="round">
            <path d="M116 74h24" /><path d="M116 86h24" /><path d="M116 98h16" />
          </g>
          <circle cx="140" cy="118" r="11" fill={C.accent} />
          <path d="M140 113v10M135 118h10" stroke={C.paper} strokeWidth="2" strokeLinecap="round" />
        </g>
      )
    case 'search':
      return (
        <g>
          <rect x="62" y="54" width="96" height="66" rx="10" fill="url(#es-panel)" stroke={C.line} strokeWidth="2" />
          <g stroke={C.line} strokeWidth="4" strokeLinecap="round" opacity="0.7">
            <path d="M76 74h40" /><path d="M76 88h56" /><path d="M76 102h32" />
          </g>
          <circle cx="132" cy="104" r="22" fill={C.paper} stroke={C.primary} strokeWidth="4" />
          <line x1="148" y1="120" x2="160" y2="132" stroke={C.primary} strokeWidth="6" strokeLinecap="round" />
          <path d="M126 104h12M132 98v12" stroke={C.accent} strokeWidth="3" strokeLinecap="round" />
        </g>
      )
    default:
      return (
        <g>
          <path d="M72 84l38-14 38 14-38 14z" fill={C.fillDeep} stroke={C.line} strokeWidth="2" strokeLinejoin="round" />
          <path d="M72 84v30l38 14V98z" fill="url(#es-panel)" stroke={C.line} strokeWidth="2" strokeLinejoin="round" />
          <path d="M148 84v30l-38 14V98z" fill={C.fill} stroke={C.line} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="110" cy="62" r="10" fill={C.accent} />
          <path d="M110 57v10M105 62h10" stroke={C.paper} strokeWidth="2" strokeLinecap="round" />
        </g>
      )
  }
}
