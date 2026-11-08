import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { Footer } from '@/components/footer'
import { NotFoundContent } from '@/components/not-found-content'

export const metadata: Metadata = {
  title: 'Página não encontrada',
  description: 'Não encontramos a página que você procurava. Veja os caminhos mais visitados da lutteros.',
  robots: { index: false, follow: true },
}

// Unmatched URLs are rendered by the root layout alone, which has no header or footer.
// Missing pages inside (public-pages) use that group's not-found.tsx instead.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <NotFoundContent standalone />
      <Footer />
    </>
  )
}
