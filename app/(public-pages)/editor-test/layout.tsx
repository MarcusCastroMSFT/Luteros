import type { Metadata } from 'next'

// Internal editor playground: reachable by URL but never meant for search results.
export const metadata: Metadata = {
  title: 'Editor de teste',
  robots: { index: false, follow: false },
}

export default function EditorTestLayout({ children }: { children: React.ReactNode }) {
  return children
}
