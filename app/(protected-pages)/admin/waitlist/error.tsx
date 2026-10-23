'use client'

import { Button } from '@/components/ui/button'

export default function WaitlistError({ reset }: { reset: () => void }) {
  return (
    <div role="alert" className="space-y-3 p-6">
      <h1 className="text-xl font-semibold">Não foi possível carregar a lista de espera.</h1>
      <p className="text-muted-foreground">Tente novamente. Se o problema persistir, contate o suporte técnico.</p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  )
}
