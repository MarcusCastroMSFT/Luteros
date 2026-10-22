import { Metadata } from 'next';
import { PageHeader } from '@/components/common/pageHeader';
import { USER_PAGE_CONTAINER } from '@/components/common/user-area';
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
    <div className="min-h-screen bg-background">
      <PageHeader
        illustration="events"
        title="Meus Eventos"
        description="Acompanhe seus eventos e não perca nenhuma data importante."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Eventos', href: '/events' },
          { label: 'Meus Eventos' },
        ]}
      />

      <div className={USER_PAGE_CONTAINER}>
        <MyEventsClient />
      </div>
    </div>
  );
}
