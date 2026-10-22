'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
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
import styles from './auth-shell.module.css'

type RegisterErrors = { fullName?: string; email?: string; password?: string; confirmPassword?: string }

export function RegisterForm() {
  const { signUp, signInWithGoogle } = useAuth()
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      await signUp(email.trim(), password, { full_name: fullName.trim() })
      toast.success('Conta criada! Seja bem-vindo(a).')
      router.push('/')
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
      toast.error(err.message || 'Falha ao entrar com Google')
    }
  }

  return (
    <div>
      <AuthNavigation active="register" />
      <AuthHeading eyebrow="Nova conta" title="Comece sua jornada" hideLeadWhenShort>
        Informação confiável sobre saúde sexual, no seu ritmo e com total discrição.
      </AuthHeading>

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
