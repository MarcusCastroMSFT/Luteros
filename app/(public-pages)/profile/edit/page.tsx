import { Metadata } from 'next';
import { PageHeader } from '@/components/common/pageHeader';
import { EditProfileClient } from './edit-profile-client';

export const metadata: Metadata = {
  title: 'Editar Perfil',
  description: 'Atualize suas informações pessoais e preferências.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function EditProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Editar Perfil"
        description="Atualize suas informações pessoais e preferências."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Meu Perfil', href: '/profile' },
          { label: 'Editar' },
        ]}
      />

      <div className="container mx-auto px-4 max-w-[1428px] py-12">
        <EditProfileClient />
      </div>
    </div>
  );
}
