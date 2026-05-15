import { Metadata } from 'next'
import { Suspense } from 'react'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
  title: 'Redefinir senha',
  description: 'Crie uma nova senha para sua conta lutteros.',
  robots: { index: false, follow: false },
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
