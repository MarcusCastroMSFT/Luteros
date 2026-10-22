import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/common/pageHeader';
import { USER_PAGE_CONTAINER } from '@/components/common/user-area';
import { getCurrentUserProfile } from '@/lib/profile';
import { EditProfileClient } from './edit-profile-client';

export const metadata: Metadata = {
  title: 'Editar Perfil',
  description: 'Atualize suas informações pessoais e preferências.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditProfilePage() {
  const profile = await getCurrentUserProfile();
  if (!profile) redirect('/login?redirectTo=/profile/edit');

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        illustration="care"
        title="Editar Perfil"
        description="Atualize suas informações pessoais e preferências."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Meu Perfil', href: '/profile' },
          { label: 'Editar' },
        ]}
      />

      <div className={USER_PAGE_CONTAINER}>
        <EditProfileClient initialProfile={profile} />
      </div>
    </div>
  );
}
