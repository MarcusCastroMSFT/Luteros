import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WordAssistantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Word Assistant</h1>
        <p className="text-muted-foreground">
          AI-powered document creation and editing assistance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Documents Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              +24 this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              AI Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              89% accepted
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Time Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34h</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Writing Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            AI-powered writing tools coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
