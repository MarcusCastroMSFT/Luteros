'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { 
  IconUser, 
  IconMail, 
  IconPhone, 
  IconCalendar, 
  IconBriefcase, 
  IconWorld, 
  IconBrandLinkedin, 
  IconBrandTwitter, 
  IconBrandInstagram,
  IconBook,
  IconCertificate,
  IconCalendarEvent,
  IconBookmark,
  IconSettings,
  IconEdit,
} from '@tabler/icons-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/ui/user-avatar';
import Link from 'next/link';
import { type UserProfileData } from '@/app/api/users/profile/route';

export function ProfileClient() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/profile');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, router]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/users/profile');
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao carregar perfil');
        return;
      }

      setProfile(data.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Erro ao carregar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Format date of birth
  const formatDateOfBirth = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (authLoading || isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchProfile}>Tentar novamente</Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Perfil não encontrado.</p>
      </div>
    );
  }

  const displayName = profile.displayName || profile.fullName || 'Usuário';

  return (
    <div className="space-y-8">
      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <UserAvatar
              name={displayName}
              avatar={profile.avatar}
              className="h-24 w-24 text-2xl"
            />
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
                {profile.title && (
                  <Badge variant="secondary">{profile.title}</Badge>
                )}
              </div>
              
              {profile.bio && (
                <p className="text-gray-600 mb-3">{profile.bio}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {profile.email && (
                  <div className="flex items-center gap-1">
                    <IconMail className="h-4 w-4" />
                    <span>{profile.email}</span>
                  </div>
                )}
                {profile.company && (
                  <div className="flex items-center gap-1">
                    <IconBriefcase className="h-4 w-4" />
                    <span>{profile.company}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <IconCalendar className="h-4 w-4" />
                  <span>Membro desde {formatDate(profile.createdAt)}</span>
                </div>
              </div>
            </div>

            <Button variant="outline" asChild className="cursor-pointer gap-2">
              <Link href="/profile/edit">
                <IconEdit className="h-4 w-4" />
                Editar Perfil
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          icon={<IconBook className="h-6 w-6 text-blue-600" />}
          label="Cursos Matriculados"
          value={profile.stats.enrolledCourses}
          href="/courses/my-courses"
        />
        <StatCard
          icon={<IconCertificate className="h-6 w-6 text-green-600" />}
          label="Cursos Concluídos"
          value={profile.stats.completedCourses}
        />
        <StatCard
          icon={<IconCalendarEvent className="h-6 w-6 text-purple-600" />}
          label="Eventos Registrados"
          value={profile.stats.registeredEvents}
          href="/events/my-events"
        />
        <StatCard
          icon={<IconBookmark className="h-6 w-6 text-orange-600" />}
          label="Artigos Salvos"
          value={profile.stats.savedArticles}
          href="/blog/saved"
        />
        <StatCard
          icon={<IconCertificate className="h-6 w-6 text-amber-600" />}
          label="Certificados"
          value={profile.stats.certificates}
        />
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUser className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label="Nome Completo" value={profile.fullName} />
            <InfoRow label="Nome de Exibição" value={profile.displayName} />
            <InfoRow label="Email" value={profile.email} />
            <InfoRow label="Telefone" value={profile.phone} />
            <InfoRow label="Data de Nascimento" value={formatDateOfBirth(profile.dateOfBirth)} />
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBriefcase className="h-5 w-5" />
              Informações Profissionais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label="Título" value={profile.title} />
            <InfoRow label="Empresa" value={profile.company} />
            <InfoRow 
              label="Website" 
              value={profile.website} 
              isLink 
            />
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconWorld className="h-5 w-5" />
              Redes Sociais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SocialRow 
              icon={<IconBrandLinkedin className="h-5 w-5 text-[#0A66C2]" />}
              label="LinkedIn" 
              value={profile.linkedin} 
            />
            <SocialRow 
              icon={<IconBrandTwitter className="h-5 w-5 text-[#1DA1F2]" />}
              label="Twitter" 
              value={profile.twitter} 
            />
            <SocialRow 
              icon={<IconBrandInstagram className="h-5 w-5 text-[#E4405F]" />}
              label="Instagram" 
              value={profile.instagram} 
            />
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconSettings className="h-5 w-5" />
              Preferências
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label="Idioma" value={profile.language === 'pt' ? 'Português' : profile.language === 'en' ? 'English' : profile.language} />
            <InfoRow label="Fuso Horário" value={profile.timezone} />
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Notificações por Email</span>
              <Badge variant={profile.emailNotifications ? 'default' : 'secondary'}>
                {profile.emailNotifications ? 'Ativado' : 'Desativado'}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-500">Emails de Marketing</span>
              <Badge variant={profile.marketingEmails ? 'default' : 'secondary'}>
                {profile.marketingEmails ? 'Ativado' : 'Desativado'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Login */}
      {profile.lastLoginAt && (
        <p className="text-center text-sm text-gray-500">
          Último acesso: {formatDate(profile.lastLoginAt)}
        </p>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  icon, 
  label, 
  value, 
  href 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number;
  href?: string;
}) {
  const content = (
    <Card className={href ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}>
      <CardContent className="pt-6 text-center">
        <div className="flex justify-center mb-2">{icon}</div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

// Info Row Component
function InfoRow({ 
  label, 
  value, 
  isLink = false 
}: { 
  label: string; 
  value: string | null | undefined;
  isLink?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      {value ? (
        isLink ? (
          <a 
            href={value.startsWith('http') ? value : `https://${value}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            {value}
          </a>
        ) : (
          <span className="text-sm font-medium text-gray-900">{value}</span>
        )
      ) : (
        <span className="text-sm text-gray-400">Não informado</span>
      )}
    </div>
  );
}

// Social Row Component
function SocialRow({ 
  icon, 
  label, 
  value 
}: { 
  icon: React.ReactNode;
  label: string; 
  value: string | null;
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      {value ? (
        <a 
          href={value.startsWith('http') ? value : `https://${value}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          {value.replace(/^https?:\/\//, '').replace(/\/$/, '')}
        </a>
      ) : (
        <span className="text-sm text-gray-400">Não vinculado</span>
      )}
    </div>
  );
}

// Skeleton Loader
function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6 text-center">
              <Skeleton className="h-6 w-6 mx-auto mb-2" />
              <Skeleton className="h-8 w-12 mx-auto mb-1" />
              <Skeleton className="h-3 w-20 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex justify-between items-center py-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
