import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProtectedLayoutClient } from "./protected-layout-client";

export const metadata: Metadata = {
  title: "Painel",
  robots: { index: false, follow: false },
};

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ALLOWED_ROLES = ['ADMIN', 'INSTRUCTOR'] as const;

// The admin area is fully request-time (session cookies), so it streams inside its own
// boundary. This replaces the app-wide <Suspense> that used to live in the root layout.
export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <Suspense fallback={null}>
      <ProtectedGate>{children}</ProtectedGate>
    </Suspense>
  );
}

async function ProtectedGate({ children }: ProtectedLayoutProps) {
  const session = await auth();

  // Middleware (proxy.ts) is the primary guard; this is defense-in-depth.
  if (!session?.user?.id) redirect('/login');

  const role = (session.user.role as string | undefined) ?? 'USER';
  if (!ALLOWED_ROLES.includes(role as typeof ALLOWED_ROLES[number])) {
    redirect('/');
  }

  const user = {
    id: session.user.id,
    email: session.user.email ?? undefined,
    fullName: session.user.name,
    displayName: session.user.displayName,
    avatar: session.user.image,
    role,
  };

  return <ProtectedLayoutClient user={user}>{children}</ProtectedLayoutClient>;
}
