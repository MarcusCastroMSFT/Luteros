'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Logo } from "@/components/common/logo"
import { translateAuthError } from '@/lib/auth-errors'

function AuthErrorReason() {
  const code = useSearchParams().get('error')
  return (
    <p className="text-gray-600 text-sm mt-2" role="alert">
      {translateAuthError(code)}
    </p>
  )
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-white">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Logo iconSize="xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Não foi possível entrar</h1>
              <Suspense fallback={null}>
                <AuthErrorReason />
              </Suspense>
            </div>
            <div className="space-y-3 pt-4">
              <Button asChild className="w-full bg-cta-highlight hover:bg-cta-highlight/90">
                <Link href="/login">Tentar novamente</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Voltar para o início</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
