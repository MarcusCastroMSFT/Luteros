'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/common/logo'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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
    <div className="w-full">
      <Card className="shadow-lg border-0 bg-white">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="flex justify-center -my-10">
              <Logo iconSize="lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Esqueceu sua senha?</h1>
              <p className="text-gray-600 text-sm mt-1">
                Informe seu e-mail e enviaremos um link para criar uma nova senha.
              </p>
            </div>
          </div>

          {submitted ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-700">
                Se houver uma conta associada a <strong>{email}</strong>, você receberá um e-mail com instruções em alguns minutos.
              </p>
              <p className="text-xs text-gray-500">
                Não esqueça de verificar a pasta de spam. O link expira em 1 hora.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Voltar para o login</Link>
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="h-10 border-gray-200 focus:border-cta-highlight focus:ring-cta-highlight"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-cta-highlight hover:bg-cta-highlight/90 text-white font-medium rounded-lg cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar link de redefinição'}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Lembrou da senha?{' '}
                <Link href="/login" className="text-cta-highlight hover:underline font-medium">
                  Entrar
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
