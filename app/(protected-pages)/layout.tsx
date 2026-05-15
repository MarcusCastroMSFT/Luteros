import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProtectedLayoutClient } from "./protected-layout-client";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ALLOWED_ROLES = ['ADMIN', 'INSTRUCTOR'] as const;

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
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
  };

  return <ProtectedLayoutClient user={user}>{children}</ProtectedLayoutClient>;
}
