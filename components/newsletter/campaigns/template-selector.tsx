"use client"

import { useState } from "react"
import { emailTemplates, EmailTemplate } from "@/data/email-templates"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  IconArticle, 
  IconSchool, 
  IconCertificate, 
  IconShoppingBag, 
  IconUsers, 
  IconCalendarEvent,
  IconSearch,
  IconCheck,
} from "@tabler/icons-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  IconArticle,
  IconSchool,
  IconCertificate,
  IconShoppingBag,
  IconUsers,
  IconCalendarEvent,
}

const categoryLabels: Record<EmailTemplate['category'], string> = {
  articles: 'Artigos',
  courses: 'Cursos',
  products: 'Produtos',
  community: 'Comunidade',
  events: 'Eventos',
  general: 'Geral',
}

const categoryColors: Record<EmailTemplate['category'], string> = {
  articles: 'bg-blue-100 text-blue-700 border-blue-200',
  courses: 'bg-green-100 text-green-700 border-green-200',
  products: 'bg-purple-100 text-purple-700 border-purple-200',
  community: 'bg-orange-100 text-orange-700 border-orange-200',
  events: 'bg-pink-100 text-pink-700 border-pink-200',
  general: 'bg-gray-100 text-gray-700 border-gray-200',
}

interface TemplateSelectorProps {
  onSelect: (template: EmailTemplate) => void
  selectedTemplateId?: string
}

export function TemplateSelector({ onSelect, selectedTemplateId }: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<EmailTemplate['category'] | 'all'>('all')

  const categories = ['all', ...Array.from(new Set(emailTemplates.map(t => t.category)))] as const

  const filteredTemplates = emailTemplates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category}
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-3 cursor-pointer",
                selectedCategory === category && "bg-muted"
              )}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'Todos' : categoryLabels[category as EmailTemplate['category']]}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredTemplates.map((template) => {
          const Icon = iconMap[template.icon] || IconArticle
          const isSelected = selectedTemplateId === template.id
          
          return (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className={cn(
                "relative p-4 border rounded-lg text-left transition-all cursor-pointer",
                "hover:border-primary hover:shadow-sm",
                isSelected 
                  ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2" 
                  : "border-border bg-background"
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <IconCheck className="h-3 w-3 text-white" />
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                  categoryColors[template.category]
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm mb-1">{template.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                  <span className={cn(
                    "inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full border",
                    categoryColors[template.category]
                  )}>
                    {categoryLabels[template.category]}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Nenhum template encontrado</p>
        </div>
      )}

      {/* Start from Scratch Option */}
      <div className="border-t pt-4">
        <button
          onClick={() => onSelect({
            id: 'blank',
            name: 'Em Branco',
            description: 'Começar do zero',
            category: 'general',
            icon: 'IconArticle',
            subject: '',
            previewText: '',
            content: `<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #18181b;">
  Olá! 👋
</p>

<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #18181b;">
  Escreva seu conteúdo aqui...
</p>`,
            ctaText: '',
            ctaUrl: '',
          })}
          className={cn(
            "w-full p-4 border-2 border-dashed rounded-lg text-center transition-all cursor-pointer",
            "hover:border-primary hover:bg-primary/5",
            selectedTemplateId === 'blank' && "border-primary bg-primary/5"
          )}
        >
          <p className="font-medium text-sm">✨ Começar do Zero</p>
          <p className="text-xs text-muted-foreground mt-1">
            Criar uma campanha em branco sem usar template
          </p>
        </button>
      </div>
    </div>
  )
}
