export default function AgentsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Page Header */}
          <div className="px-4 lg:px-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">Agentes IA</h1>
              <p className="text-muted-foreground">
                Gerencie seus agentes de inteligência artificial e suas configurações.
              </p>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-4 lg:px-6">
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">
                Página de agentes em desenvolvimento
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}