import { Metadata } from 'next';
import { PageHeader } from '@/components/common/pageHeader';
import { USER_PAGE_CONTAINER } from '@/components/common/user-area';
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
    <div className="min-h-screen bg-background">
      <PageHeader
        illustration="courses"
        title="Meus Cursos"
        description="Acompanhe seu progresso e continue aprendendo."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Cursos', href: '/courses' },
          { label: 'Meus Cursos' },
        ]}
      />

      <div className={USER_PAGE_CONTAINER}>
        <MyCoursesClient />
      </div>
    </div>
  );
}
