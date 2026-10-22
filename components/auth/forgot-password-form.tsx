'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { AuthHeading, SubmitButton, TextField, focusFirstInvalid, isEmailFormat } from './auth-ui'
import styles from './auth-shell.module.css'

export function ForgotPasswordForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setEmailError('Informe seu e-mail.')
      focusFirstInvalid(formRef.current)
      return
    }
    if (!isEmailFormat(email)) {
      setEmailError('Informe um e-mail válido, como nome@email.com.')
      focusFirstInvalid(formRef.current)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!response.ok) {
        throw new Error('Falha ao enviar o e-mail')
      }
      setSubmitted(true)
    } catch (error) {
      const err = error as { message?: string }
      toast.error(err.message || 'Falha ao enviar o e-mail')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <AuthHeading eyebrow="Recuperar acesso" title="Esqueceu a senha?">
        Informe seu e-mail e enviaremos um link para criar uma nova senha.
      </AuthHeading>

      {submitted ? (
        <div className={styles.form}>
          <p className={styles.notice}>
            Se houver uma conta associada a <strong>{email}</strong>, você receberá um e-mail com instruções em alguns minutos.
          </p>
          <p className={styles.noticeMuted}>
            Não esqueça de verificar a pasta de spam. O link expira em 1 hora.
          </p>
          <Link href="/login" className={styles.secondary}>Voltar para o login</Link>
        </div>
      ) : (
        <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate>
          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={(value) => { setEmail(value); setEmailError(null) }}
            placeholder="seu@email.com"
            autoComplete="email"
            disabled={isSubmitting}
            error={emailError}
          />

          <SubmitButton pending={isSubmitting} pendingLabel="Enviando...">Enviar link de redefinição</SubmitButton>

          <p className={styles.switchLine}>
            Lembrou da senha?{' '}
            <Link href="/login" className={styles.inlineLink}>Entrar</Link>
          </p>
        </form>
      )}
    </div>
  )
}
