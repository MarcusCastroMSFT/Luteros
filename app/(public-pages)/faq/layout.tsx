import type { Metadata } from 'next'
import { DEFAULT_SOCIAL_IMAGE } from '@/lib/social-images'

const title = 'Perguntas frequentes'
const description =
  'Respostas sobre a Lutteros: conteúdos gratuitos e pagos, cursos, pagamentos, conta, privacidade e como falar com a equipe.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/faq' },
  openGraph: {
    type: 'website',
    url: '/faq',
    title: `${title} | lutteros`,
    description,
    images: [DEFAULT_SOCIAL_IMAGE],
  },
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children
}
