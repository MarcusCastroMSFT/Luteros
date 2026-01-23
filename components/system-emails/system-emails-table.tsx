"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnFiltersState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  IconSearch, 
  IconRefresh, 
  IconLoader2, 
  IconMailForward,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { getTemplateColumns, type SystemEmailTemplate } from "./template-columns"
import { TemplateEditorDialog } from "./template-editor-dialog"
import { SystemEmailPreview } from "./email-preview"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function SystemEmailsTable() {
  const [templates, setTemplates] = useState<SystemEmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  
  // Dialog states
  const [editorOpen, setEditorOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [testDialogOpen, setTestDialogOpen] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<SystemEmailTemplate | null>(null)
  const [testEmail, setTestEmail] = useState("")
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/system-emails')
      const data = await response.json()

      if (data.success) {
        setTemplates(data.data)
      } else {
        toast.error('Erro ao carregar templates')
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Erro ao carregar templates')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // Handle actions
  const handleEdit = useCallback((template: SystemEmailTemplate) => {
    setSelectedTemplate(template)
    setEditorOpen(true)
  }, [])

  const handlePreview = useCallback((template: SystemEmailTemplate) => {
    setSelectedTemplate(template)
    setPreviewOpen(true)
  }, [])

  const handleSendTest = useCallback((template: SystemEmailTemplate) => {
    setSelectedTemplate(template)
    setTestDialogOpen(true)
  }, [])

  const handleReset = useCallback((template: SystemEmailTemplate) => {
    setSelectedTemplate(template)
    setResetDialogOpen(true)
  }, [])

  const handleToggleActive = useCallback(async (template: SystemEmailTemplate) => {
    try {
      const response = await fetch(`/api/system-emails/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !template.isActive }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao atualizar status')
      }

      toast.success(template.isActive 
        ? `Template "${template.name}" desativado` 
        : `Template "${template.name}" ativado`
      )
      fetchTemplates()
    } catch (error) {
      console.error('Error toggling template status:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar status')
    }
  }, [fetchTemplates])

  const confirmSendTest = async () => {
    if (!selectedTemplate || !testEmail.trim() || !testEmail.includes('@')) {
      toast.error('Digite um e-mail válido')
      return
    }

    setIsSendingTest(true)

    try {
      const response = await fetch(`/api/system-emails/${selectedTemplate.id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao enviar e-mail de teste')
      }

      toast.success(`E-mail de teste enviado para ${testEmail}`)
      setTestDialogOpen(false)
      setTestEmail('')
    } catch (error) {
      console.error('Error sending test:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar teste')
    } finally {
      setIsSendingTest(false)
    }
  }

  const confirmReset = async () => {
    if (!selectedTemplate) return

    setIsResetting(true)

    try {
      const response = await fetch(`/api/system-emails/${selectedTemplate.id}/reset`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao restaurar template')
      }

      toast.success('Template restaurado para os valores padrão')
      setResetDialogOpen(false)
      fetchTemplates()
    } catch (error) {
      console.error('Error resetting:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao restaurar')
    } finally {
      setIsResetting(false)
    }
  }

  // Table columns
  const columns = useMemo(
    () => getTemplateColumns(handleEdit, handlePreview, handleSendTest, handleReset, handleToggleActive),
    [handleEdit, handlePreview, handleSendTest, handleReset, handleToggleActive]
  )

  // Filter templates by search and category
  const filteredTemplates = useMemo(() => {
    let result = templates

    if (searchValue) {
      const search = searchValue.toLowerCase()
      result = result.filter(
        t =>
          t.name.toLowerCase().includes(search) ||
          t.code.toLowerCase().includes(search) ||
          t.subject.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search)
      )
    }

    if (categoryFilter !== "all") {
      result = result.filter(t => t.category === categoryFilter)
    }

    return result
  }, [templates, searchValue, categoryFilter])

  const table = useReactTable({
    data: filteredTemplates,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      columnFilters,
    },
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            <SelectItem value="AUTHENTICATION">Autenticação</SelectItem>
            <SelectItem value="ACCOUNT">Conta</SelectItem>
            <SelectItem value="NOTIFICATION">Notificação</SelectItem>
            <SelectItem value="TRANSACTION">Transação</SelectItem>
            <SelectItem value="ENGAGEMENT">Engajamento</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchTemplates} disabled={loading} className="cursor-pointer">
          <IconRefresh className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <IconLoader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum template encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Count */}
      <div className="text-sm text-muted-foreground">
        {filteredTemplates.length} de {templates.length} templates
      </div>

      {/* Editor Dialog */}
      <TemplateEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        template={selectedTemplate}
        onSuccess={fetchTemplates}
      />

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Visualização: {selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <SystemEmailPreview
              subject={selectedTemplate.subject}
              previewText={selectedTemplate.previewText || ''}
              htmlContent={selectedTemplate.htmlContent}
              variables={selectedTemplate.variables}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Test Email Dialog */}
      <AlertDialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enviar e-mail de teste</AlertDialogTitle>
            <AlertDialogDescription>
              Digite o endereço de e-mail para onde deseja enviar um teste do template &quot;{selectedTemplate?.name}&quot;.
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
                  confirmSendTest()
                }
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTestEmail('')} className="cursor-pointer">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmSendTest} disabled={isSendingTest} className="cursor-pointer">
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

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar template padrão?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá restaurar o template &quot;{selectedTemplate?.name}&quot; para seus valores originais.
              Todas as alterações feitas serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset} disabled={isResetting} className="cursor-pointer">
              {isResetting && <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />}
              Restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
