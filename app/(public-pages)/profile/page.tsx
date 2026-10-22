import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/common/pageHeader';
import { USER_PAGE_CONTAINER } from '@/components/common/user-area';
import { getCurrentUserProfile } from '@/lib/profile';
import { ProfileClient } from './profile-client';

export const metadata: Metadata = {
  title: 'Meu Perfil',
  description: 'Visualize e gerencie as informações do seu perfil.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfilePage() {
  const profile = await getCurrentUserProfile();
  if (!profile) redirect('/login?redirectTo=/profile');

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        illustration="care"
        title="Meu Perfil"
        description="Visualize e gerencie suas informações pessoais."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Meu Perfil' },
        ]}
      />

      <div className={USER_PAGE_CONTAINER}>
        <ProfileClient initialProfile={profile} />
      </div>
    </div>
  );
}
