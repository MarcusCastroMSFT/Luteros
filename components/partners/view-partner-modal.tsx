'use client'

import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Mail, Phone, Calendar, Package } from "lucide-react"
import { PartnerRow } from "./partner-columns"

interface ViewPartnerModalProps {
  partner: PartnerRow
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewPartnerModal({ partner, open, onOpenChange }: ViewPartnerModalProps) {
  const createdDate = new Date(partner.createdAt)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {partner.logo ? (
              <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-semibold text-primary">
                  {partner.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <span>{partner.name}</span>
              <Badge 
                variant="outline" 
                className={partner.status === "Ativo" 
                  ? "ml-2 bg-green-100 text-green-800 border-green-200" 
                  : "ml-2 bg-gray-100 text-gray-800 border-gray-200"
                }
              >
                {partner.status}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            Detalhes do parceiro
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Description */}
          {partner.description && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h4>
              <p className="text-sm">{partner.description}</p>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Contato</h4>
            
            {partner.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`mailto:${partner.email}`} 
                  className="text-primary hover:underline"
                >
                  {partner.email}
                </a>
              </div>
            )}
            
            {partner.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`tel:${partner.phone}`} 
                  className="text-primary hover:underline"
                >
                  {partner.phone}
                </a>
              </div>
            )}
            
            {!partner.email && !partner.phone && (
              <p className="text-sm text-muted-foreground">Nenhuma informação de contato</p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Package className="h-4 w-4" />
                <span className="text-xs">Produtos</span>
              </div>
              <p className="text-2xl font-semibold">{partner.productsCount}</p>
            </div>
            
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">Criado em</span>
              </div>
              <p className="text-sm font-medium">
                {createdDate.toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Website Button */}
          {partner.website && (
            <Button asChild className="w-full cursor-pointer">
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Visitar Website
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
