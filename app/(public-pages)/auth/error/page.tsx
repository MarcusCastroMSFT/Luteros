'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Logo } from "@/components/common/logo"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-white">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Logo iconSize="xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Authentication Error</h1>
              <p className="text-gray-600 text-sm mt-2">
                There was a problem signing you in. This could be due to an expired link or invalid credentials.
              </p>
            </div>
            <div className="space-y-3 pt-4">
              <Button asChild className="w-full bg-cta-highlight hover:bg-cta-highlight/90">
                <Link href="/login">Try Again</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Go Home</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
