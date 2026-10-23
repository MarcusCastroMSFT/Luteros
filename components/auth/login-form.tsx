'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import {
  AuthDivider,
  AuthHeading,
  AuthNavigation,
  GoogleButton,
  PasswordField,
  SubmitButton,
  TextField,
  focusFirstInvalid,
  isEmailFormat,
} from './auth-ui'
import { AuthErrorNotice } from './auth-error-notice'
import { ResendVerificationButton } from './resend-verification-button'
import { translateAuthError } from '@/lib/auth-errors'
import styles from './auth-shell.module.css'

type LoginErrors = { email?: string; password?: string }

export function LoginForm() {
  const { signIn, signInWithGoogle } = useAuth()
  const formRef = useRef<HTMLFormElement>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<LoginErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const next: LoginErrors = {}
    if (!email.trim()) next.email = 'Informe seu e-mail.'
    else if (!isEmailFormat(email)) next.email = 'Informe um e-mail válido, como nome@email.com.'
    if (!password) next.password = 'Informe sua senha.'
    setErrors(next)
    if (Object.keys(next).length > 0) {
      focusFirstInvalid(formRef.current)
      return
    }

    setIsSubmitting(true)
    setUnverifiedEmail(null)
    try {
      await signIn(email.trim(), password)
      toast.success('Bem-vindo de volta!')
    } catch (error) {
      const err = error as { message?: string }
      if (err.message === 'email_not_verified') {
        setUnverifiedEmail(email.trim())
      } else {
        toast.error(translateAuthError(err.message))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      const err = error as { message?: string }
      toast.error(translateAuthError(err.message, 'google'))
    }
  }

  return (
    <div>
      <AuthNavigation active="login" />
      <AuthHeading eyebrow="Sua conta" title="Bem-vindo de volta">
        Cursos, artigos e especialistas em saúde sexual, com o cuidado que você merece.
      </AuthHeading>

      <AuthErrorNotice />

      {unverifiedEmail ? (
        <div role="alert" className={styles.alert}>
          {translateAuthError('email_not_verified')}
          <ResendVerificationButton email={unverifiedEmail} />
        </div>
      ) : null}

      <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate>
        <TextField
          label="E-mail"
          type="email"
          value={email}
          onChange={(value) => { setEmail(value); setErrors((prev) => ({ ...prev, email: undefined })) }}
          placeholder="seu@email.com"
          autoComplete="email"
          disabled={isSubmitting}
          error={errors.email}
        />
        <PasswordField
          label="Senha"
          value={password}
          onChange={(value) => { setPassword(value); setErrors((prev) => ({ ...prev, password: undefined })) }}
          autoComplete="current-password"
          disabled={isSubmitting}
          error={errors.password}
          labelAside={<Link href="/forgot-password" className={styles.link}>Esqueceu sua senha?</Link>}
        />

        <SubmitButton pending={isSubmitting} pendingLabel="Entrando...">Entrar</SubmitButton>

        <AuthDivider>ou</AuthDivider>
        <GoogleButton onClick={handleGoogleSignIn} disabled={isSubmitting} />
      </form>
    </div>
  )
}
