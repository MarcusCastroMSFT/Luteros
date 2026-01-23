"use client"

import { SystemEmailsTable } from "@/components/system-emails"
import { IconMail, IconInfoCircle } from "@tabler/icons-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

export default function SystemEmailsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Page Header */}
          <div className="px-4 lg:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <IconMail className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl font-semibold tracking-tight">E-mails do Sistema</h1>
                </div>
                <p className="text-muted-foreground mt-1">
                  Personalize os templates de e-mails transacionais da plataforma.
                </p>
              </div>
            </div>
          </div>

          {/* Info Alert */}
          <div className="px-4 lg:px-6">
            <Alert>
              <IconInfoCircle className="h-4 w-4" />
              <AlertTitle>Dica</AlertTitle>
              <AlertDescription>
                Os e-mails do sistema são enviados automaticamente em eventos como cadastro, 
                recuperação de senha, confirmação de matrícula, etc. 
                Use variáveis como <code className="bg-muted px-1 py-0.5 rounded text-xs">{`{{name}}`}</code> para 
                inserir dados dinâmicos. Cada template mostra as variáveis disponíveis.
              </AlertDescription>
            </Alert>
          </div>

          {/* Templates Table */}
          <div className="px-4 lg:px-6">
            <SystemEmailsTable />
          </div>
        </div>
      </div>
    </div>
  )
}
