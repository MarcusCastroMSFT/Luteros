'use client'

import { useEffect, useState } from 'react'
import styles from './auth-shell.module.css'

const COOLDOWN_SECONDS = 60

/** Asks the server for a new confirmation link. The answer never reveals whether the account exists. */
export function ResendVerificationButton({ email, className }: { email: string; className?: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle')
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  const resend = async () => {
    setStatus('sending')
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) throw new Error('request failed')
      setStatus('sent')
      setSecondsLeft(COOLDOWN_SECONDS)
    } catch {
      setStatus('failed')
    }
  }

  const label =
    status === 'sending'
      ? 'Enviando...'
      : secondsLeft > 0
        ? `Link reenviado. Você pode pedir outro em ${secondsLeft}s.`
        : status === 'failed'
          ? 'Não foi possível reenviar. Tentar de novo'
          : 'Reenviar e-mail de confirmação'

  return (
    <button
      type="button"
      className={className ?? styles.alertAction}
      onClick={resend}
      disabled={status === 'sending' || secondsLeft > 0}
      aria-live="polite"
    >
      {label}
    </button>
  )
}
