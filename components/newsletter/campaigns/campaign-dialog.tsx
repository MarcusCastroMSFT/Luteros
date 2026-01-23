"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { IconLoader2, IconSend, IconDeviceFloppy } from "@tabler/icons-react"
import { toast } from "sonner"
import type { Campaign } from "./campaign-columns"

interface CampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: Campaign | null
  onSuccess: () => void
}

export function CampaignDialog({ 
  open, 
  onOpenChange, 
  campaign, 
  onSuccess 
}: CampaignDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    previewText: '',
    content: '',
    ctaText: '',
    ctaUrl: '',
  })

  const isEditing = !!campaign
  const isReadOnly = campaign?.status === 'SENT' || campaign?.status === 'SENDING'

  useEffect(() => {
    if (campaign) {
      // Fetch full campaign data
      fetch(`/api/newsletter/campaigns/${campaign.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.campaign) {
            setFormData({
              name: data.campaign.name || '',
              subject: data.campaign.subject || '',
              previewText: data.campaign.previewText || '',
              content: data.campaign.content || '',
              ctaText: data.campaign.ctaText || '',
              ctaUrl: data.campaign.ctaUrl || '',
            })
          }
        })
        .catch(err => console.error('Error fetching campaign:', err))
    } else {
      setFormData({
        name: '',
        subject: '',
        previewText: '',
        content: '',
        ctaText: '',
        ctaUrl: '',
      })
    }
  }, [campaign])

  const handleSubmit = async (e: React.FormEvent, sendNow: boolean = false) => {
    e.preventDefault()
    
    if (!formData.name || !formData.subject || !formData.content) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setIsLoading(true)
    try {
      const url = isEditing 
        ? `/api/newsletter/campaigns/${campaign.id}`
        : '/api/newsletter/campaigns'
      
      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Erro ao salvar campanha')
        return
      }

      if (sendNow) {
        // Send the campaign immediately
        setIsSending(true)
        const campaignId = isEditing ? campaign.id : data.campaign.id
        
        const sendResponse = await fetch(`/api/newsletter/campaigns/${campaignId}/send`, {
          method: 'POST',
        })
        
        const sendData = await sendResponse.json()
        
        if (!sendResponse.ok) {
          toast.error('Campanha salva, mas erro ao enviar', {
            description: sendData.error,
          })
        } else {
          toast.success('Campanha enviada!', {
            description: `${sendData.stats.sent} emails enviados com sucesso.`,
          })
        }
        setIsSending(false)
      } else {
        toast.success(isEditing ? 'Campanha atualizada!' : 'Campanha criada!')
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving campaign:', error)
      toast.error('Erro ao salvar campanha')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? (isReadOnly ? 'Visualizar Campanha' : 'Editar Campanha') : 'Nova Campanha'}
          </DialogTitle>
          <DialogDescription>
            {isReadOnly 
              ? 'Esta campanha já foi enviada e não pode ser editada.'
              : 'Crie uma campanha de email para enviar aos seus inscritos.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => handleSubmit(e, false)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Campanha *</Label>
              <Input
                id="name"
                placeholder="Ex: Newsletter Janeiro 2026"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={isReadOnly || isLoading}
                required
              />
              <p className="text-xs text-muted-foreground">
                Nome interno para identificar a campanha
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">Assunto do Email *</Label>
              <Input
                id="subject"
                placeholder="Ex: 🎉 Novidades da lutteros!"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                disabled={isReadOnly || isLoading}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="previewText">Texto de Pré-visualização</Label>
              <Input
                id="previewText"
                placeholder="Texto que aparece antes de abrir o email..."
                value={formData.previewText}
                onChange={(e) => setFormData(prev => ({ ...prev, previewText: e.target.value }))}
                disabled={isReadOnly || isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Aparece nos clientes de email antes de abrir a mensagem
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Conteúdo do Email *</Label>
              <Textarea
                id="content"
                placeholder="Escreva o conteúdo do seu email aqui... Você pode usar HTML."
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                disabled={isReadOnly || isLoading}
                rows={8}
                required
              />
              <p className="text-xs text-muted-foreground">
                Suporta HTML. Use {'<p>'}, {'<strong>'}, {'<a href="">'} etc.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ctaText">Texto do Botão (CTA)</Label>
                <Input
                  id="ctaText"
                  placeholder="Ex: Ver Cursos"
                  value={formData.ctaText}
                  onChange={(e) => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
                  disabled={isReadOnly || isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ctaUrl">Link do Botão</Label>
                <Input
                  id="ctaUrl"
                  type="url"
                  placeholder="https://..."
                  value={formData.ctaUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, ctaUrl: e.target.value }))}
                  disabled={isReadOnly || isLoading}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {!isReadOnly && (
              <>
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isLoading || isSending}
                >
                  {isLoading ? (
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <IconDeviceFloppy className="mr-2 h-4 w-4" />
                  )}
                  Salvar Rascunho
                </Button>
                <Button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={isLoading || isSending}
                >
                  {isSending ? (
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <IconSend className="mr-2 h-4 w-4" />
                  )}
                  Salvar e Enviar
                </Button>
              </>
            )}
            {isReadOnly && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Fechar
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
