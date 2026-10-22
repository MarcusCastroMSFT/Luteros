'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import {
  AuthHeading,
  PasswordField,
  PasswordRequirements,
  SubmitButton,
  allPasswordRequirementsMet,
  focusFirstInvalid,
} from './auth-ui'
import styles from './auth-shell.module.css'

type ResetErrors = { password?: string; confirmPassword?: string }

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''
  const formRef = useRef<HTMLFormElement>(null)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<ResetErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const missingTokenOrEmail = !token || !email

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const next: ResetErrors = {}
    if (!password) next.password = 'Crie uma nova senha.'
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
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao redefinir a senha')
      }
      toast.success('Senha redefinida com sucesso. Faça login com a nova senha.')
      router.push('/login')
    } catch (error) {
      const err = error as { message?: string }
      toast.error(err.message || 'Falha ao redefinir a senha')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <AuthHeading eyebrow="Nova senha" title="Crie uma nova senha">
        Defina uma senha forte para proteger sua conta.
      </AuthHeading>

      {missingTokenOrEmail ? (
        <div className={styles.form}>
          <p className={styles.notice}>
            O link de redefinição está incompleto ou inválido. Solicite um novo link.
          </p>
          <Link href="/forgot-password" className={styles.secondary}>Solicitar novo link</Link>
        </div>
      ) : (
        <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <PasswordField
              label="Nova senha"
              value={password}
              onChange={(value) => { setPassword(value); setErrors((prev) => ({ ...prev, password: undefined })) }}
              autoComplete="new-password"
              disabled={isSubmitting}
              error={errors.password}
            />
            <PasswordRequirements password={password} />
          </div>
          <PasswordField
            label="Confirmar senha"
            value={confirmPassword}
            onChange={(value) => { setConfirmPassword(value); setErrors((prev) => ({ ...prev, confirmPassword: undefined })) }}
            autoComplete="new-password"
            disabled={isSubmitting}
            error={errors.confirmPassword}
          />

          <SubmitButton pending={isSubmitting} pendingLabel="Redefinindo...">Redefinir senha</SubmitButton>
        </form>
      )}
    </div>
  )
}
