"use client"

import { useState } from "react"
import { IconDeviceMobile, IconDeviceDesktop, IconMail } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

  // Generate full email HTML for preview
  const generateEmailHtml = () => {
    const brandColor = '#84cc16'
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <!-- Preview Text (hidden but shows in email clients) -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${previewText}
  </div>
  
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 24px; text-align: center; border-bottom: 1px solid #e4e4e7;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #18181b;">
                <span style="color: ${brandColor};">🌿</span> lutteros
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              ${content}
              
              ${ctaText && ctaUrl ? `
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 32px 0 16px;">
                <tr>
                  <td align="center">
                    <a href="${ctaUrl}" style="display: inline-block; padding: 14px 32px; background-color: ${brandColor}; color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-radius: 0 0 12px 12px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #71717a;">
                      Você recebeu este email porque está inscrito na newsletter da lutteros.
                    </p>
                    <p style="margin: 0; font-size: 14px;">
                      <a href="#" style="color: #71717a; text-decoration: underline;">Cancelar inscrição</a>
                      &nbsp;•&nbsp;
                      <a href="https://lutteros.com.br" style="color: #71717a; text-decoration: underline;">Visitar site</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Copyright -->
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; margin-top: 24px;">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                © ${new Date().getFullYear()} lutteros. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  }

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
          <div className="w-10 h-10 rounded-full bg-lime-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
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
            className="w-full h-full min-h-[500px] bg-white rounded-lg shadow-lg border"
            title="Email Preview"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  )
}
