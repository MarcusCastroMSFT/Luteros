"use client"

import { useState } from "react"
import { IconDeviceMobile, IconDeviceDesktop } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SystemEmailPreviewProps {
  subject: string
  previewText?: string
  htmlContent: string
  variables?: string[]
}

export function SystemEmailPreview({
  subject,
  previewText,
  htmlContent,
  variables = [],
}: SystemEmailPreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')

  // Generate sample variables for preview
  const getSampleVariables = (): Record<string, string> => {
    const samples: Record<string, string> = {
      name: 'João Silva',
      email: 'joao@exemplo.com',
      appUrl: 'https://lutteros.com.br',
      year: new Date().getFullYear().toString(),
      verificationLink: 'https://lutteros.com.br/verify?token=abc123',
      resetLink: 'https://lutteros.com.br/reset-password?token=abc123',
      expiresIn: '24 horas',
      changedAt: new Date().toLocaleString('pt-BR'),
      updatedAt: new Date().toLocaleString('pt-BR'),
      oldEmail: 'antigo@exemplo.com',
      newEmail: 'novo@exemplo.com',
      courseName: 'Introdução ao Bem-Estar',
      courseUrl: 'https://lutteros.com.br/courses/introducao',
      instructorName: 'Dra. Maria Santos',
      progress: '65',
      lastLesson: 'Módulo 3: Práticas Diárias',
      eventName: 'Workshop de Meditação',
      eventDate: '15 de Janeiro de 2026',
      eventLocation: 'Online via Zoom',
      eventUrl: 'https://lutteros.com.br/events/meditacao',
      certificateUrl: 'https://lutteros.com.br/certificates/12345',
      completedAt: '10 de Janeiro de 2026',
      orderNumber: '12345',
      orderDate: new Date().toLocaleDateString('pt-BR'),
      items: 'Curso Premium - R$ 197,00',
      total: 'R$ 197,00',
      paymentMethod: 'Cartão de Crédito',
      lastVisit: '15 de Dezembro de 2025',
    }
    return samples
  }

  // Replace variables in HTML content for preview
  const renderPreviewHtml = () => {
    let html = htmlContent
    const samples = getSampleVariables()
    
    for (const [key, value] of Object.entries(samples)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      html = html.replace(regex, value)
    }
    
    return html
  }

  const renderedHtml = renderPreviewHtml()

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('desktop')}
            className="cursor-pointer"
          >
            <IconDeviceDesktop className="h-4 w-4 mr-1" />
            Desktop
          </Button>
          <Button
            variant={viewMode === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('mobile')}
            className="cursor-pointer"
          >
            <IconDeviceMobile className="h-4 w-4 mr-1" />
            Mobile
          </Button>
        </div>
        
        {variables.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Variáveis disponíveis: {variables.join(', ')}
          </div>
        )}
      </div>

      {/* Email Client Simulation */}
      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        {/* Email Header */}
        <div className="border-b bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-lime-100 flex items-center justify-center">
              <span className="text-lime-600 font-semibold">L</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">lutteros</span>
                <span className="text-xs text-muted-foreground">&lt;noreply@lutteros.com.br&gt;</span>
              </div>
              <p className="font-semibold text-sm truncate mt-0.5">{subject}</p>
              {previewText && (
                <p className="text-xs text-muted-foreground truncate">{previewText}</p>
              )}
            </div>
          </div>
        </div>

        {/* Email Body */}
        <div 
          className={cn(
            "bg-zinc-100 transition-all duration-300 overflow-auto",
            viewMode === 'desktop' ? "p-4" : "p-2"
          )}
        >
          <div 
            className={cn(
              "mx-auto transition-all duration-300",
              viewMode === 'desktop' ? "max-w-[650px]" : "max-w-[375px]"
            )}
          >
            <iframe
              srcDoc={renderedHtml}
              title="Email Preview"
              className={cn(
                "w-full border-0 bg-white rounded-lg shadow-sm transition-all duration-300",
                viewMode === 'desktop' ? "min-h-[600px]" : "min-h-[700px]"
              )}
              sandbox="" // Empty sandbox for maximum security - no scripts, forms, or navigation
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
