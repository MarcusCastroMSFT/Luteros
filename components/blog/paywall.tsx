import Link from 'next/link';
import { Lock, Stethoscope, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaywallProps {
  audience: 'general' | 'doctors';
  isAuthenticated: boolean;
  /** Path for login redirect (typically the current article URL). */
  redirectTo?: string;
}

export function Paywall({ audience, isAuthenticated, redirectTo }: PaywallProps) {
  const isDoctors = audience === 'doctors';

  return (
    <div className="relative -mt-12 pt-16 pointer-events-none">
      {/* Fade-out gradient overlaying the bottom of the truncated content */}
      <div
        aria-hidden
        className="absolute inset-x-0 -top-32 h-32 bg-gradient-to-b from-transparent to-white"
      />

      <div className="pointer-events-auto rounded-2xl border border-amber-200 bg-amber-50/60 p-6 sm:p-10 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 rounded-full bg-amber-100 p-3">
            <Lock className="w-6 h-6 text-amber-700" aria-hidden />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-700 uppercase tracking-wide mb-2">
              Conteúdo exclusivo para assinantes
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 font-cardo">
              {isDoctors
                ? 'Acesse este artigo com um plano para profissionais'
                : 'Continue lendo com uma assinatura'}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              {isDoctors
                ? 'Este conteúdo é exclusivo para profissionais de saúde assinantes. Assinantes do plano Médicos têm acesso a artigos técnicos, protocolos clínicos e estudos de caso.'
                : 'Continue lendo este artigo e tenha acesso ilimitado a todo nosso conteúdo educacional sobre saúde sexual e bem-estar.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Button asChild size="lg" className="cursor-pointer">
                <Link href="/pricing">
                  {isDoctors ? (
                    <>
                      <Stethoscope className="w-4 h-4 mr-2" />
                      Ver plano Médicos
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Ver planos
                    </>
                  )}
                </Link>
              </Button>

              {!isAuthenticated && (
                <p className="text-sm text-gray-600">
                  Já é assinante?{' '}
                  <Link
                    href={`/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`}
                    className="text-primary hover:underline font-medium"
                  >
                    Entrar
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
