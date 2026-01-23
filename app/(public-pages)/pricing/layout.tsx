import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Planos e Preços | lutteros - Aprenda e Evolua',
  description: 'Escolha o plano ideal para acelerar seu aprendizado. Plano gratuito disponível, Premium a partir de R$ 39,90/mês. Garantia de 7 dias.',
  keywords: [
    'preços lutteros',
    'planos de assinatura',
    'cursos online',
    'aprendizado premium',
    'educação profissional',
    'desenvolvimento de carreira'
  ],
  openGraph: {
    title: 'Planos e Preços | lutteros',
    description: 'Escolha o plano ideal para acelerar seu aprendizado. Plano gratuito disponível, Premium a partir de R$ 39,90/mês.',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Planos e Preços | lutteros',
    description: 'Escolha o plano ideal para acelerar seu aprendizado. Plano gratuito disponível, Premium a partir de R$ 39,90/mês.',
  },
  alternates: {
    canonical: '/pricing'
  }
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
