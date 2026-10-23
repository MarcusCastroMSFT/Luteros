'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { quickValidateEmail } from '@/lib/email-quick-validation'
import {
  AuthDivider,
  AuthHeading,
  AuthNavigation,
  GoogleButton,
  PasswordField,
  PasswordRequirements,
  SubmitButton,
  TextField,
  allPasswordRequirementsMet,
  focusFirstInvalid,
} from './auth-ui'
import { AuthErrorNotice } from './auth-error-notice'
import { ResendVerificationButton } from './resend-verification-button'
import { translateAuthError } from '@/lib/auth-errors'
import styles from './auth-shell.module.css'

type RegisterErrors = { fullName?: string; email?: string; password?: string; confirmPassword?: string }

export function RegisterForm() {
  const { signUp, signInWithGoogle } = useAuth()
  const formRef = useRef<HTMLFormElement>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingEmail, setPendingEmail] = useState<{ address: string; sent: boolean } | null>(null)

  const clear = (field: keyof RegisterErrors) => setErrors((prev) => ({ ...prev, [field]: undefined }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const next: RegisterErrors = {}
    if (fullName.trim().length < 2) next.fullName = 'Informe seu nome completo.'
    if (!email.trim()) next.email = 'Informe seu e-mail.'
    else {
      const emailCheck = quickValidateEmail(email)
      if (!emailCheck.isValid) next.email = emailCheck.error
    }
    if (!password) next.password = 'Crie uma senha.'
    else if (!allPasswordRequirementsMet(password)) next.password = 'A senha ainda não atende a todos os requisitos.'
    if (!confirmPassword) next.confirmPassword = 'Confirme sua senha.'
    else if (password !== confirmPassword) next.confirmPassword = 'As senhas não coincidem.'
    setErrors(next)
    if (Object.keys(next).length > 0) {
      focusFirstInvalid(formRef.current)
      return
    }

    setIsSubmitting(true)
    try {
      const { emailSent } = await signUp(email.trim(), password, { full_name: fullName.trim() })
      setPendingEmail({ address: email.trim(), sent: emailSent })
      window.scrollTo({ top: 0 })
    } catch (error) {
      const err = error as { message?: string }
      toast.error(err.message || 'Falha ao criar a conta')
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

  if (pendingEmail) {
    return (
      <div>
        <AuthHeading eyebrow="Quase lá" title="Confirme seu e-mail">
          Sua conta foi criada. Falta só confirmar que o e-mail é seu.
        </AuthHeading>
        <div className={styles.form} role="status">
          <p className={styles.notice}>
            {pendingEmail.sent ? 'Enviamos um link de confirmação para ' : 'Não conseguimos enviar o link agora para '}
            <strong>{pendingEmail.address}</strong>
            {pendingEmail.sent
              ? '. Abra o e-mail e toque em “Confirmar e-mail” para ativar sua conta.'
              : '. Use o botão abaixo para tentar de novo.'}
          </p>
          <p className={styles.noticeMuted}>
            Não chegou em alguns minutos? Confira a pasta de spam ou de promoções. O link vale por 24 horas.
          </p>
          <ResendVerificationButton email={pendingEmail.address} className={styles.secondary} />
          <p className={styles.switchLine}>
            Já confirmou? <Link href="/login" className={styles.inlineLink}>Entrar</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AuthNavigation active="register" />
      <AuthHeading eyebrow="Nova conta" title="Comece sua jornada" hideLeadWhenShort>
        Informação confiável sobre saúde sexual, no seu ritmo e com total discrição.
      </AuthHeading>

      <AuthErrorNotice />

      <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate>
        <TextField
          label="Nome completo"
          value={fullName}
          onChange={(value) => { setFullName(value); clear('fullName') }}
          placeholder="Maria Silva"
          autoComplete="name"
          disabled={isSubmitting}
          error={errors.fullName}
        />
        <TextField
          label="E-mail"
          type="email"
          value={email}
          onChange={(value) => { setEmail(value); clear('email') }}
          placeholder="seu@email.com"
          autoComplete="email"
          disabled={isSubmitting}
          error={errors.email}
        />
        <div className={styles.field}>
          <div className={styles.row2}>
            <PasswordField
              label="Senha"
              value={password}
              onChange={(value) => { setPassword(value); clear('password') }}
              autoComplete="new-password"
              disabled={isSubmitting}
              invalid={!!errors.password}
            />
            <PasswordField
              label="Confirmar senha"
              value={confirmPassword}
              onChange={(value) => { setConfirmPassword(value); clear('confirmPassword') }}
              autoComplete="new-password"
              disabled={isSubmitting}
              invalid={!!errors.confirmPassword}
            />
          </div>
          <PasswordRequirements password={password} />
          {errors.password ? <p className={styles.error} role="alert">{errors.password}</p> : null}
          {errors.confirmPassword ? <p className={styles.error} role="alert">{errors.confirmPassword}</p> : null}
        </div>

        <SubmitButton pending={isSubmitting} pendingLabel="Criando conta...">Criar conta</SubmitButton>

        <AuthDivider>ou</AuthDivider>
        <GoogleButton onClick={handleGoogleSignIn} disabled={isSubmitting} />
      </form>
    </div>
  )
}
