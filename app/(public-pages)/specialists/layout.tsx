import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Especialistas em Saúde Sexual | lutteros',
  description: 'Conheça nossos profissionais qualificados em saúde sexual e educação. Encontre especialistas em ginecologia, contracepção, saúde reprodutiva e muito mais.',
  keywords: 'especialistas, saúde sexual, ginecologia, contracepção, educação sexual, saúde reprodutiva',
  openGraph: {
    title: 'Especialistas em Saúde Sexual | lutteros',
    description: 'Conheça nossos profissionais qualificados em saúde sexual e educação.',
    type: 'website',
  },
};

export default function SpecialistsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
