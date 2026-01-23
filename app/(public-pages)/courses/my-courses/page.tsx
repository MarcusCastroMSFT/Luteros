import { Metadata } from 'next';
import { PageHeader } from '@/components/common/pageHeader';
import { MyCoursesClient } from './my-courses-client';

export const metadata: Metadata = {
  title: 'Meus Cursos',
  description: 'Acompanhe seu progresso e continue aprendendo com seus cursos.',
  robots: {
    index: false, // Don't index personal pages
    follow: false,
  },
};

export default function MyCoursesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Meus Cursos"
        description="Acompanhe seu progresso e continue aprendendo."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Cursos', href: '/courses' },
          { label: 'Meus Cursos' },
        ]}
      />

      <div className="container mx-auto px-4 max-w-[1428px] py-12">
        <MyCoursesClient />
      </div>
    </div>
  );
}
