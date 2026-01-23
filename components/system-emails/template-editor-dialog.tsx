"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  IconLoader2, 
  IconDeviceFloppy,
  IconEdit, 
  IconEye,
  IconCode,
  IconRefresh,
  IconMailForward,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { SystemEmailPreview } from "./email-preview"
import type { SystemEmailTemplate } from "./template-columns"

interface TemplateEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: SystemEmailTemplate | null
  onSuccess: () => void
}

export function TemplateEditorDialog({ 
  open, 
  onOpenChange, 
  template, 
  onSuccess 
}: TemplateEditorDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('editor')
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    previewText: '',
    htmlContent: '',
    textContent: '',
    isActive: true,
  })

  // Reset form when template changes
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || '',
        subject: template.subject,
        previewText: template.previewText || '',
        htmlContent: template.htmlContent,
        textContent: template.textContent || '',
        isActive: template.isActive,
      })
      setActiveTab('editor')
    }
  }, [template])

  const handleInputChange = useCallback((field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSave = async () => {
    if (!template) return
    
    if (!formData.subject.trim()) {
      toast.error('O assunto é obrigatório')
      return
    }

    if (!formData.htmlContent.trim()) {
      toast.error('O conteúdo HTML é obrigatório')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/system-emails/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao salvar template')
      }

      toast.success('Template salvo com sucesso!')
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar template')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async () => {
    if (!template) return
    
    setIsLoading(true)
    setShowResetDialog(false)

    try {
      const response = await fetch(`/api/system-emails/${template.id}/reset`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao restaurar template')
      }

      // Update form with restored data
      setFormData({
        name: data.data.name,
        description: data.data.description || '',
        subject: data.data.subject,
        previewText: data.data.previewText || '',
        htmlContent: data.data.htmlContent,
        textContent: data.data.textContent || '',
        isActive: data.data.isActive,
      })

      toast.success('Template restaurado para os valores padrão!')
      onSuccess()
    } catch (error) {
      console.error('Error resetting template:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao restaurar template')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendTest = async () => {
    if (!template) return
    
    if (!testEmail.trim() || !testEmail.includes('@')) {
      toast.error('Digite um e-mail válido')
      return
    }

    setIsSendingTest(true)

    try {
      // First save any changes
      const saveResponse = await fetch(`/api/system-emails/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!saveResponse.ok) {
        throw new Error('Erro ao salvar alterações antes do envio')
      }

      // Then send test email
      const response = await fetch(`/api/system-emails/${template.id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao enviar e-mail de teste')
      }

      toast.success(`E-mail de teste enviado para ${testEmail}`)
      setShowTestDialog(false)
      setTestEmail('')
    } catch (error) {
      console.error('Error sending test email:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar e-mail de teste')
    } finally {
      setIsSendingTest(false)
    }
  }

  if (!template) return null

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      AUTHENTICATION: 'Autenticação',
      ACCOUNT: 'Conta',
      NOTIFICATION: 'Notificação',
      TRANSACTION: 'Transação',
      ENGAGEMENT: 'Engajamento',
    }
    return labels[category] || category
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl">{template.name}</DialogTitle>
              <Badge variant="outline">
                {getCategoryLabel(template.category)}
              </Badge>
              <Badge variant={template.isActive ? "default" : "secondary"}>
                {template.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <DialogDescription>
              {template.description}
              {template.variables.length > 0 && (
                <span className="block mt-1 text-xs">
                  Variáveis: {template.variables.map(v => `{{${v}}}`).join(', ')}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor" className="gap-2">
                <IconEdit className="h-4 w-4" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2">
                <IconCode className="h-4 w-4" />
                Código HTML
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <IconEye className="h-4 w-4" />
                Visualizar
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto mt-4">
              {/* Editor Tab */}
              <TabsContent value="editor" className="m-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Template</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Ex: E-mail de Boas-vindas"
                    />
                  </div>
                  <div className="space-y-2 flex items-end gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                      />
                      <Label htmlFor="isActive">Template ativo</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Quando este e-mail é enviado?"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Assunto do E-mail *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Ex: Bem-vindo à lutteros!"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use {`{{variavel}}`} para inserir dados dinâmicos
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="previewText">Texto de Pré-visualização</Label>
                    <Input
                      id="previewText"
                      value={formData.previewText}
                      onChange={(e) => handleInputChange('previewText', e.target.value)}
                      placeholder="Texto que aparece antes de abrir o e-mail"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textContent">Conteúdo em Texto Puro (fallback)</Label>
                  <Textarea
                    id="textContent"
                    value={formData.textContent}
                    onChange={(e) => handleInputChange('textContent', e.target.value)}
                    placeholder="Versão em texto simples do e-mail..."
                    className="min-h-[150px] font-mono text-sm"
                  />
                </div>
              </TabsContent>

              {/* Code Tab */}
              <TabsContent value="code" className="m-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="htmlContent">Código HTML do E-mail *</Label>
                    <span className="text-xs text-muted-foreground">
                      {formData.htmlContent.length} caracteres
                    </span>
                  </div>
                  <Textarea
                    id="htmlContent"
                    value={formData.htmlContent}
                    onChange={(e) => handleInputChange('htmlContent', e.target.value)}
                    placeholder="<!DOCTYPE html>..."
                    className="min-h-[500px] font-mono text-xs"
                  />
                </div>
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview" className="m-0">
                <SystemEmailPreview
                  subject={formData.subject}
                  previewText={formData.previewText}
                  htmlContent={formData.htmlContent}
                  variables={template.variables}
                />
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="gap-2 sm:gap-0">
            <div className="flex-1 flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowResetDialog(true)}
                disabled={isLoading}
                className="cursor-pointer"
              >
                <IconRefresh className="h-4 w-4 mr-2" />
                Restaurar Padrão
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowTestDialog(true)}
                disabled={isLoading}
                className="cursor-pointer"
              >
                <IconMailForward className="h-4 w-4 mr-2" />
                Enviar Teste
              </Button>
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading} className="cursor-pointer">
              {isLoading ? (
                <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <IconDeviceFloppy className="h-4 w-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar template padrão?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá restaurar o template para seus valores originais.
              Todas as alterações feitas serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="cursor-pointer">
              Restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Test Email Dialog */}
      <AlertDialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enviar e-mail de teste</AlertDialogTitle>
            <AlertDialogDescription>
              Digite o endereço de e-mail para onde deseja enviar um teste deste template.
              O e-mail será enviado com o prefixo [TESTE] no assunto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="email"
              placeholder="seu@email.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSendTest()
                }
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTestEmail('')} className="cursor-pointer">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSendTest} disabled={isSendingTest} className="cursor-pointer">
              {isSendingTest ? (
                <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <IconMailForward className="h-4 w-4 mr-2" />
              )}
              Enviar Teste
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
