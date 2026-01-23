"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Logo } from "@/components/common/logo"
import { 
  IconLoader2, 
  IconMailOff, 
  IconCheck, 
  IconAlertTriangle,
  IconArrowLeft,
  IconMoodSad,
} from "@tabler/icons-react"

const unsubscribeReasons = [
  { id: "too-many", label: "Recebo muitos emails" },
  { id: "not-relevant", label: "O conteúdo não é relevante para mim" },
  { id: "never-signed", label: "Não me lembro de ter me inscrito" },
  { id: "other", label: "Outro motivo" },
]

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subscriber, setSubscriber] = useState<{
    email: string
    alreadyUnsubscribed: boolean
  } | null>(null)
  const [unsubscribed, setUnsubscribed] = useState(false)
  const [selectedReason, setSelectedReason] = useState<string>("")
  const [otherReason, setOtherReason] = useState("")

  useEffect(() => {
    if (!token) {
      setError('Link de cancelamento inválido. Verifique se copiou o link corretamente.')
      setLoading(false)
      return
    }

    // Fetch subscriber info
    fetch(`/api/newsletter/unsubscribe?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setSubscriber(data.subscriber)
          if (data.subscriber.alreadyUnsubscribed) {
            setUnsubscribed(true)
          }
        }
      })
      .catch(() => {
        setError('Erro ao carregar informações. Tente novamente.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [token])

  const handleUnsubscribe = async () => {
    if (!token) return

    setProcessing(true)
    try {
      const reason = selectedReason === 'other' 
        ? otherReason 
        : unsubscribeReasons.find(r => r.id === selectedReason)?.label

      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, reason }),
      })

      const data = await response.json()

      if (data.success) {
        setUnsubscribed(true)
      } else {
        setError(data.error || 'Erro ao cancelar inscrição')
      }
    } catch {
      setError('Erro ao processar o cancelamento. Tente novamente.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 flex flex-col">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-lg mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <IconArrowLeft className="h-4 w-4" />
            Voltar para o site
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-xl border p-8 md:p-10">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Logo iconSize="xl" showText={true} />
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <IconLoader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="text-center py-8">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <IconAlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h1 className="text-xl font-semibold text-foreground mb-2">
                  Algo deu errado
                </h1>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Link href="/">
                  <Button variant="outline" className="cursor-pointer">
                    Voltar para o site
                  </Button>
                </Link>
              </div>
            )}

            {/* Already Unsubscribed or Success State */}
            {!loading && !error && unsubscribed && (
              <div className="text-center py-8">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <IconCheck className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-xl font-semibold text-foreground mb-2">
                  Inscrição Cancelada
                </h1>
                <p className="text-muted-foreground mb-6">
                  Você não receberá mais emails da nossa newsletter.
                </p>
                <div className="p-4 bg-zinc-50 rounded-lg mb-6">
                  <p className="text-sm text-muted-foreground">
                    Cancelou por engano?{' '}
                    <Link href="/newsletter" className="text-primary font-medium hover:underline">
                      Inscreva-se novamente
                    </Link>
                  </p>
                </div>
                <Link href="/">
                  <Button className="cursor-pointer">
                    Voltar para o site
                  </Button>
                </Link>
              </div>
            )}

            {/* Unsubscribe Form */}
            {!loading && !error && subscriber && !unsubscribed && (
              <div>
                <div className="text-center mb-6">
                  <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                    <IconMoodSad className="h-8 w-8 text-orange-600" />
                  </div>
                  <h1 className="text-xl font-semibold text-foreground mb-2">
                    Que pena que você quer ir embora!
                  </h1>
                  <p className="text-muted-foreground">
                    Você está cancelando a inscrição para <strong>{subscriber.email}</strong>
                  </p>
                </div>

                {/* Reason Selection */}
                <div className="mb-6">
                  <p className="text-sm font-medium mb-3">
                    Pode nos dizer o motivo? (opcional)
                  </p>
                  <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
                    {unsubscribeReasons.map((reason) => (
                      <div key={reason.id} className="flex items-center space-x-2 py-2">
                        <RadioGroupItem value={reason.id} id={reason.id} />
                        <Label htmlFor={reason.id} className="cursor-pointer">
                          {reason.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {selectedReason === 'other' && (
                    <Textarea
                      placeholder="Conte-nos o motivo..."
                      value={otherReason}
                      onChange={(e) => setOtherReason(e.target.value)}
                      className="mt-3"
                      rows={3}
                    />
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleUnsubscribe}
                    disabled={processing}
                    variant="destructive"
                    className="w-full cursor-pointer"
                  >
                    {processing ? (
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <IconMailOff className="mr-2 h-4 w-4" />
                    )}
                    Cancelar Inscrição
                  </Button>
                  <Link href="/">
                    <Button variant="outline" className="w-full cursor-pointer">
                      Mudei de ideia, quero continuar inscrito
                    </Button>
                  </Link>
                </div>

                {/* Alternative */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Dica:</strong> Se você acha que está recebendo muitos emails, 
                    podemos reduzir a frequência. Entre em contato conosco em{' '}
                    <a href="mailto:contato@lutteros.com.br" className="underline">
                      contato@lutteros.com.br
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            © {new Date().getFullYear()} lutteros. Todos os direitos reservados.
          </p>
        </div>
      </main>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 flex items-center justify-center">
        <IconLoader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  )
}
