import { Metadata } from 'next';
import { PageHeader } from '@/components/common/pageHeader';
import { MyEventsClient } from './my-events-client';

export const metadata: Metadata = {
  title: 'Meus Eventos',
  description: 'Veja seus eventos registrados e acompanhe os próximos eventos.',
  robots: {
    index: false, // Don't index personal pages
    follow: false,
  },
};

export default function MyEventsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Meus Eventos"
        description="Acompanhe seus eventos e não perca nenhuma data importante."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Eventos', href: '/events' },
          { label: 'Meus Eventos' },
        ]}
      />

      <div className="container mx-auto px-4 max-w-[1428px] py-12">
        <MyEventsClient />
      </div>
    </div>
  );
}
