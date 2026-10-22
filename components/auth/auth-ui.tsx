'use client'

import { useId, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { Check, Eye, EyeOff, X } from 'lucide-react'
import styles from './auth-shell.module.css'

export const PASSWORD_REQUIREMENTS = [
  { label: 'Pelo menos 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Uma letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Um número', test: (p: string) => /[0-9]/.test(p) },
]

export function allPasswordRequirementsMet(password: string): boolean {
  return PASSWORD_REQUIREMENTS.every((requirement) => requirement.test(password))
}

// Lenient on purpose: used where existing accounts must still be able to sign in.
export function isEmailFormat(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

// Forms use noValidate: we show our own messages and move focus to the first invalid field.
export function focusFirstInvalid(form: HTMLFormElement | null) {
  requestAnimationFrame(() => form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
}

// Client-side so the layout can stay statically prerenderable (no Date in a Server Component).
export function CurrentYear() {
  return <>{new Date().getFullYear()}</>
}

export function AuthNavigation({ active }: { active: 'login' | 'register' }) {
  return (
    <nav className={styles.switcher} aria-label="Acesso à plataforma">
      <Link href="/login" aria-current={active === 'login' ? 'page' : undefined}>Entrar</Link>
      <Link href="/register" aria-current={active === 'register' ? 'page' : undefined}>Criar conta</Link>
    </nav>
  )
}

export function AuthHeading({ eyebrow, title, children, hideLeadWhenShort }: { eyebrow: string; title: string; children?: ReactNode; hideLeadWhenShort?: boolean }) {
  return (
    <div className={styles.heading}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 className={styles.title}>{title}</h1>
      {children ? <p className={`${styles.lead} ${hideLeadWhenShort ? styles.leadShort : ''}`}>{children}</p> : null}
    </div>
  )
}

interface FieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  disabled?: boolean
  invalid?: boolean
  labelAside?: ReactNode
  error?: string | null
}

export function TextField({ label, type = 'text', labelAside, error, ...props }: FieldProps & { type?: 'text' | 'email' }) {
  const id = useId()
  const errorId = `${id}-error`
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>{label}</label>
        {labelAside}
      </div>
      <div className={styles.control}>
        <input
          id={id}
          type={type}
          className={styles.input}
          value={props.value}
          onChange={(event) => props.onChange(event.target.value)}
          placeholder={props.placeholder}
          autoComplete={props.autoComplete}
          disabled={props.disabled}
          aria-required="true"
          aria-invalid={props.invalid || error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
      </div>
      {error ? <p id={errorId} className={styles.error} role="alert">{error}</p> : null}
    </div>
  )
}

export function PasswordField({ label, labelAside, error, ...props }: FieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  const [visible, setVisible] = useState(false)
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>{label}</label>
        {labelAside}
      </div>
      <div className={styles.control}>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={`${styles.input} ${styles.hasToggle}`}
          value={props.value}
          onChange={(event) => props.onChange(event.target.value)}
          placeholder={props.placeholder ?? '••••••••'}
          autoComplete={props.autoComplete}
          disabled={props.disabled}
          aria-required="true"
          aria-invalid={props.invalid || error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
      </div>
      {error ? <p id={errorId} className={styles.error} role="alert">{error}</p> : null}
    </div>
  )
}

export function PasswordRequirements({ password }: { password: string }) {
  if (!password) return null
  return (
    <ul className={styles.requirements} aria-label="Requisitos da senha">
      {PASSWORD_REQUIREMENTS.map(({ label, test }) => {
        const met = test(password)
        return (
          <li key={label} data-met={met}>
            {met ? <Check size={12} aria-hidden="true" /> : <X size={12} aria-hidden="true" />}
            {label}
          </li>
        )
      })}
    </ul>
  )
}

export function AuthDivider({ children }: { children: ReactNode }) {
  return <p className={styles.divider}>{children}</p>
}

export function SubmitButton({ pending, children, pendingLabel }: { pending: boolean; children: ReactNode; pendingLabel: string }) {
  return (
    <button type="submit" className={styles.primary} disabled={pending}>
      {pending ? pendingLabel : children}
    </button>
  )
}

export function GoogleButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" className={styles.secondary} onClick={onClick} disabled={disabled}>
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
          fill="currentColor"
        />
      </svg>
      Continuar com Google
    </button>
  )
}
