import { Metadata } from 'next';
import { PageHeader } from '@/components/common/pageHeader';
import { ProfileClient } from './profile-client';

export const metadata: Metadata = {
  title: 'Meu Perfil',
  description: 'Visualize e gerencie as informações do seu perfil.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Meu Perfil"
        description="Visualize e gerencie suas informações pessoais."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Meu Perfil' },
        ]}
      />

      <div className="container mx-auto px-4 max-w-[1428px] py-12">
        <ProfileClient />
      </div>
    </div>
  );
}
