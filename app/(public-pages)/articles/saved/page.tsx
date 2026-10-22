import { Metadata } from 'next';
import { PageHeader } from '@/components/common/pageHeader';
import { USER_PAGE_CONTAINER } from '@/components/common/user-area';
import { SavedArticlesClient } from './saved-articles-client';

export const metadata: Metadata = {
  title: 'Artigos Salvos',
  description: 'Acesse seus artigos salvos e continue sua leitura.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SavedArticlesPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        illustration="articles"
        title="Artigos Salvos"
        description="Acesse seus artigos salvos e continue sua leitura."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Artigos', href: '/articles' },
          { label: 'Artigos Salvos' },
        ]}
      />

      <div className={USER_PAGE_CONTAINER}>
        <SavedArticlesClient />
      </div>
    </div>
  );
}
