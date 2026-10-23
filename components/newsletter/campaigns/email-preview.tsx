"use client"

import { useState } from "react"
import { IconDeviceMobile, IconDeviceDesktop, IconMail } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { renderCampaignEmail } from "@/lib/email-campaign"

interface EmailPreviewProps {
  subject: string
  previewText: string
  content: string
  ctaText?: string
  ctaUrl?: string
}

export function EmailPreview({
  subject,
  previewText,
  content,
  ctaText,
  ctaUrl,
}: EmailPreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')

  // Same renderer as the real send, so the preview matches the inbox.
  const generateEmailHtml = () =>
    renderCampaignEmail('assinante@exemplo.com', {
      subject: subject || 'Sem assunto',
      previewText,
      content,
      ctaText,
      ctaUrl,
    }).html

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <IconMail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Pré-visualização</span>
        </div>
        <div className="flex items-center gap-1 bg-background rounded-lg p-1 border">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 cursor-pointer",
              viewMode === 'desktop' && "bg-muted"
            )}
            onClick={() => setViewMode('desktop')}
          >
            <IconDeviceDesktop className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 cursor-pointer",
              viewMode === 'mobile' && "bg-muted"
            )}
            onClick={() => setViewMode('mobile')}
          >
            <IconDeviceMobile className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Email Client Preview Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#198189] flex items-center justify-center text-white font-semibold text-sm shrink-0">
            LU
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">lutteros</span>
              <span className="text-xs text-muted-foreground">
                &lt;noreply@lutteros.com.br&gt;
              </span>
            </div>
            <p className="font-semibold text-sm mt-1 truncate">{subject || 'Sem assunto'}</p>
            <p className="text-xs text-muted-foreground truncate">
              {previewText || 'Sem texto de pré-visualização'}
            </p>
          </div>
        </div>
      </div>

      {/* Email Body Preview */}
      <div className="flex-1 overflow-auto bg-zinc-100 p-4 flex justify-center">
        <div 
          className={cn(
            "transition-all duration-200",
            viewMode === 'desktop' ? "w-full max-w-[640px]" : "w-[375px]"
          )}
        >
          <iframe
            srcDoc={generateEmailHtml()}
            className="w-full h-full min-h-[760px] bg-white rounded-lg shadow-lg border"
            title="Email Preview"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  )
}
