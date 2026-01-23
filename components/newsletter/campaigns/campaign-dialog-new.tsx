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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  IconLoader2, 
  IconSend, 
  IconDeviceFloppy, 
  IconTemplate, 
  IconEdit, 
  IconEye,
  IconArrowRight,
  IconArrowLeft,
} from "@tabler/icons-react"
import { toast } from "sonner"
import type { Campaign } from "./campaign-columns"
import { TemplateSelector } from "./template-selector"
import { EmailPreview } from "./email-preview"
import type { EmailTemplate } from "@/data/email-templates"

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
  const [activeTab, setActiveTab] = useState<string>('template')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>()
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
            // Skip template selection when editing
            setActiveTab('editor')
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
      setSelectedTemplateId(undefined)
      setActiveTab('template')
    }
  }, [campaign, open])

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplateId(template.id)
    setFormData({
      name: formData.name || template.name,
      subject: template.subject,
      previewText: template.previewText,
      content: template.content,
      ctaText: template.ctaText,
      ctaUrl: template.ctaUrl,
    })
  }

  const handleContinueToEditor = () => {
    if (!selectedTemplateId) {
      toast.error('Selecione um template para continuar')
      return
    }
    setActiveTab('editor')
  }

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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? (isReadOnly ? 'Visualizar Campanha' : 'Editar Campanha') : 'Nova Campanha'}
          </DialogTitle>
          <DialogDescription>
            {isReadOnly 
              ? 'Esta campanha já foi enviada e não pode ser editada.'
              : isEditing 
                ? 'Edite os detalhes da sua campanha de email.'
                : 'Escolha um template, personalize o conteúdo e visualize antes de enviar.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger 
              value="template" 
              className="flex items-center gap-2 cursor-pointer"
              disabled={isEditing}
            >
              <IconTemplate className="h-4 w-4" />
              Template
            </TabsTrigger>
            <TabsTrigger 
              value="editor" 
              className="flex items-center gap-2 cursor-pointer"
              disabled={!isEditing && !selectedTemplateId}
            >
              <IconEdit className="h-4 w-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="flex items-center gap-2 cursor-pointer"
              disabled={!formData.content}
            >
              <IconEye className="h-4 w-4" />
              Visualizar
            </TabsTrigger>
          </TabsList>

          {/* Template Selection Tab */}
          <TabsContent value="template" className="flex-1 overflow-auto mt-4">
            <TemplateSelector 
              onSelect={handleTemplateSelect}
              selectedTemplateId={selectedTemplateId}
            />
          </TabsContent>

          {/* Editor Tab */}
          <TabsContent value="editor" className="flex-1 overflow-auto mt-4">
            <form id="campaign-form" onSubmit={(e) => handleSubmit(e, false)}>
              <div className="grid gap-4 pb-4">
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
                    rows={12}
                    className="font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Suporta HTML com estilos inline. Use a aba &quot;Visualizar&quot; para ver o resultado.
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
            </form>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="flex-1 overflow-hidden mt-4 -mx-6 -mb-6">
            <EmailPreview
              subject={formData.subject}
              previewText={formData.previewText}
              content={formData.content}
              ctaText={formData.ctaText}
              ctaUrl={formData.ctaUrl}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
          {activeTab === 'template' && !isEditing && (
            <Button
              type="button"
              onClick={handleContinueToEditor}
              disabled={!selectedTemplateId}
              className="cursor-pointer"
            >
              Continuar
              <IconArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          {activeTab === 'editor' && !isReadOnly && (
            <>
              {!isEditing && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveTab('template')}
                  className="cursor-pointer"
                >
                  <IconArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              )}
              <Button
                type="submit"
                form="campaign-form"
                variant="outline"
                disabled={isLoading || isSending}
                className="cursor-pointer"
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
                onClick={() => setActiveTab('preview')}
                variant="secondary"
                className="cursor-pointer"
              >
                <IconEye className="mr-2 h-4 w-4" />
                Visualizar
              </Button>
            </>
          )}

          {activeTab === 'preview' && !isReadOnly && (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setActiveTab('editor')}
                className="cursor-pointer"
              >
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Editor
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={(e) => handleSubmit(e, false)}
                disabled={isLoading || isSending}
                className="cursor-pointer"
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
                className="cursor-pointer"
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
              className="cursor-pointer"
            >
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
