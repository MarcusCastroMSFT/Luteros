import type { Metadata } from 'next'
import { NotFoundContent } from '@/components/not-found-content'

export const metadata: Metadata = {
  title: 'Página não encontrada',
  description: 'Não encontramos a página que você procurava. Veja os caminhos mais visitados da lutteros.',
  robots: { index: false, follow: true },
}

// The public layout already renders the header, footer and <main>.
export default function PublicNotFound() {
  return <NotFoundContent />
}
