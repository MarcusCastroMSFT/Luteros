'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/common/logo"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { Eye, EyeOff, Check, X } from "lucide-react"

const PASSWORD_REQUIREMENTS = [
  { label: 'Pelo menos 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Uma letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Um número', test: (p: string) => /[0-9]/.test(p) },
]

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signUp, signInWithGoogle } = useAuth()
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const passwordTouched = password.length > 0
  const allRequirementsMet = PASSWORD_REQUIREMENTS.every(r => r.test(password))
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0
  const confirmTouched = confirmPassword.length > 0

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
      await signUp(email, password, { full_name: fullName })
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
    <div className={cn("w-full", className)} {...props}>
      <Card className="shadow-lg border-0 bg-white">
        <CardContent className="p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Logo and Header */}
            <div className="text-center">
              <div className="flex justify-center -my-10">
                <Logo iconSize="lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Crie sua conta</h1>
                <p className="text-gray-600 text-sm mt-1">
                  Comece sua jornada de aprendizado hoje
                </p>
              </div>
            </div>

            {/* Full Name Field */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Nome completo
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Maria Silva"
                className="h-10 border-gray-200 focus:border-cta-highlight focus:ring-cta-highlight"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Email Field */}
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

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Senha
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
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Live password requirements */}
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
                        {met
                          ? <Check className="w-3 h-3 shrink-0" />
                          : <X className="w-3 h-3 shrink-0" />
                        }
                        {label}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Confirm Password Field */}
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
                  onClick={() => setShowConfirmPassword(v => !v)}
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

            {/* Sign Up Button */}
            <Button
              type="submit"
              className="w-full h-10 bg-cta-highlight hover:bg-cta-highlight/90 text-white font-medium rounded-lg cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando conta...' : 'Cadastrar'}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-500">Ou continue com</span>
              </div>
            </div>

            {/* Social Login */}
            <Button
              variant="outline"
              type="button"
              className="w-full h-10 border-gray-200 hover:bg-gray-50 cursor-pointer"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Google
            </Button>

            {/* Sign In Link */}
            <div className="text-center text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-cta-highlight hover:underline font-medium">
                Entrar
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Terms */}
      <div className="text-center text-xs text-gray-500 mt-4 px-4">
        Ao continuar, você concorda com nossos{" "}
        <Link href="/terms" className="underline hover:text-cta-highlight">
          Termos de Serviço
        </Link>{" "}
        e{" "}
        <Link href="/privacy" className="underline hover:text-cta-highlight">
          Política de Privacidade
        </Link>
        .
      </div>
    </div>
  )
}
