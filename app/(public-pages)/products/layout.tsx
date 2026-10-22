import type { Metadata } from 'next';
import { DEFAULT_SOCIAL_IMAGE } from '@/lib/social-images';

export const metadata: Metadata = {
  title: 'Produtos e Descontos Exclusivos | lutteros',
  description: 'Descontos especiais em produtos e serviços selecionados para mães, pais e famílias. Membros têm acesso a ofertas exclusivas em suplementos, consultorias, moda e muito mais.',
  keywords: [
    'descontos exclusivos',
    'produtos para mães',
    'produtos para bebês',
    'suplementos gestantes',
    'roupas maternidade',
    'ofertas exclusivas',
    'cupons de desconto',
    'benefícios membros'
  ],
  openGraph: {
    images: [DEFAULT_SOCIAL_IMAGE],
    title: 'Produtos e Descontos Exclusivos | lutteros',
    description: 'Descontos especiais em produtos e serviços para mães, pais e famílias. Ofertas exclusivas para membros!',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    images: [DEFAULT_SOCIAL_IMAGE.url],
    card: 'summary_large_image',
    title: 'Produtos e Descontos Exclusivos | lutteros',
    description: 'Descontos especiais em produtos e serviços para mães, pais e famílias. Ofertas exclusivas para membros!',
  },
  alternates: {
    canonical: '/products'
  }
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
