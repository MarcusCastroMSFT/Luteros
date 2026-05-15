'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/common/logo'
import { Eye, EyeOff, Check, X } from 'lucide-react'

const PASSWORD_REQUIREMENTS = [
  { label: 'Pelo menos 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Uma letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Um número', test: (p: string) => /[0-9]/.test(p) },
]

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const passwordTouched = password.length > 0
  const allRequirementsMet = PASSWORD_REQUIREMENTS.every((r) => r.test(password))
  const confirmTouched = confirmPassword.length > 0
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const missingTokenOrEmail = !token || !email

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allRequirementsMet) {
      toast.error('A senha não atende a todos os requisitos')
      return
    }
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem')
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
    <div className="w-full">
      <Card className="shadow-lg border-0 bg-white">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="flex justify-center -my-10">
              <Logo iconSize="lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Crie uma nova senha</h1>
              <p className="text-gray-600 text-sm mt-1">
                Defina uma senha forte para proteger sua conta.
              </p>
            </div>
          </div>

          {missingTokenOrEmail ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-700">
                O link de redefinição está incompleto ou inválido. Solicite um novo link.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/forgot-password">Solicitar novo link</Link>
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Nova senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-10 border-gray-200 focus:border-cta-highlight focus:ring-cta-highlight pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {passwordTouched && (
                  <ul className="space-y-1 mt-1">
                    {PASSWORD_REQUIREMENTS.map(({ label, test }) => {
                      const met = test(password)
                      return (
                        <li
                          key={label}
                          className={cn(
                            'flex items-center gap-1.5 text-xs transition-colors',
                            met ? 'text-green-600' : 'text-gray-400'
                          )}
                        >
                          {met ? (
                            <Check className="w-3 h-3 shrink-0" />
                          ) : (
                            <X className="w-3 h-3 shrink-0" />
                          )}
                          {label}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirmar senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={cn(
                      'h-10 border-gray-200 focus:border-cta-highlight focus:ring-cta-highlight pr-10',
                      confirmTouched && !passwordsMatch && 'border-red-300 focus:border-red-400'
                    )}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmTouched && !passwordsMatch && (
                  <p className="text-xs text-red-500">As senhas não coincidem</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-cta-highlight hover:bg-cta-highlight/90 text-white font-medium rounded-lg cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Redefinindo...' : 'Redefinir senha'}
              </Button>

              <div className="text-center text-sm text-gray-600">
                <Link href="/login" className="text-cta-highlight hover:underline font-medium">
                  Voltar para o login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
