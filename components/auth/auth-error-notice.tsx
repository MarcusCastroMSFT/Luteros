'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { translateAuthError } from '@/lib/auth-errors'
import styles from './auth-shell.module.css'

function AuthErrorMessage() {
  const params = useSearchParams()
  const code = params.get('error')

  if (!code && params.get('verified') === '1') {
    return (
      <p role="status" className={styles.success}>
        E-mail confirmado. Agora é só entrar com seu e-mail e senha.
      </p>
    )
  }
  if (!code) return null

  // Social sign-in errors come back to this page as /login?error=<code>.
  return (
    <p role="alert" className={styles.alert}>
      {translateAuthError(code, 'google')}
    </p>
  )
}

/** Shows the Auth.js error from the URL (e.g. after returning from Google) so a failed sign-in is never silent. */
export function AuthErrorNotice() {
  return (
    <Suspense fallback={null}>
      <AuthErrorMessage />
    </Suspense>
  )
}
