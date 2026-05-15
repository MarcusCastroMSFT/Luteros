'use client'

import { useState } from 'react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/common/logo"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

function translateAuthError(code?: string, provider?: 'google' | 'credentials'): string {
  switch (code) {
    case 'CredentialsSignin':
      return 'E-mail ou senha incorretos.'
    case 'AccessDenied':
      return 'Acesso negado.'
    case 'Verification':
      return 'Link de verificação inválido ou expirado.'
    case 'OAuthAccountNotLinked':
      return 'Este e-mail já está associado a outro método de login.'
    case 'OAuthSignin':
    case 'OAuthCallback':
    case 'OAuthCreateAccount':
      return 'Falha ao entrar com Google. Tente novamente.'
    case 'Callback':
      return 'Erro ao processar o login. Tente novamente.'
    case 'Configuration':
      return 'Erro de configuração do servidor. Contate o suporte.'
    default:
      return provider === 'google'
        ? 'Falha ao entrar com Google. Tente novamente.'
        : 'Falha ao entrar. Verifique seus dados e tente novamente.'
  }
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await signIn(email, password)
      toast.success('Bem-vindo de volta!')
    } catch (error) {
      const err = error as { message?: string }
      toast.error(translateAuthError(err.message))
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
                <h1 className="text-xl font-bold text-gray-900">Bem-vindo de volta</h1>
                <p className="text-gray-600 text-sm mt-1">
                  Acesse sua conta lutteros
                </p>
              </div>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Senha
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-cta-highlight hover:underline"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
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
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-10 bg-cta-highlight hover:bg-cta-highlight/90 text-white font-medium rounded-lg cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Ou continue com</span>
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

            {/* Sign Up Link */}
            <div className="text-center text-sm text-gray-600">
              Não tem uma conta?{" "}
              <Link href="/register" className="text-cta-highlight hover:underline font-medium">
                Cadastre-se
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
