import { Metadata } from 'next';
import { PageHeader } from '@/components/common/pageHeader';
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
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Artigos Salvos"
        description="Acesse seus artigos salvos e continue sua leitura."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: 'Artigos Salvos' },
        ]}
      />

      <div className="container mx-auto px-4 max-w-[1428px] py-12">
        <SavedArticlesClient />
      </div>
    </div>
  );
}
