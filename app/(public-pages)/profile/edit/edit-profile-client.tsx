'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import {
  IconUser,
  IconBriefcase,
  IconWorld,
  IconSettings,
  IconArrowLeft,
  IconDeviceFloppy,
} from '@tabler/icons-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import Link from 'next/link';
import type { UserProfileData } from '@/app/api/users/profile/route';

interface EditProfileClientProps {
  initialProfile: UserProfileData;
}

export function EditProfileClient({ initialProfile }: EditProfileClientProps) {
  const { refreshProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // Form state seeded from SSR-fetched profile
  const [formData, setFormData] = useState({
    fullName: initialProfile.fullName || '',
    displayName: initialProfile.displayName || '',
    bio: initialProfile.bio || '',
    phone: initialProfile.phone || '',
    dateOfBirth: initialProfile.dateOfBirth ? initialProfile.dateOfBirth.split('T')[0] : '',
    title: initialProfile.title || '',
    company: initialProfile.company || '',
    website: initialProfile.website || '',
    linkedin: initialProfile.linkedin || '',
    twitter: initialProfile.twitter || '',
    instagram: initialProfile.instagram || '',
    language: initialProfile.language || 'pt',
    timezone: initialProfile.timezone || 'America/Sao_Paulo',
    emailNotifications: initialProfile.emailNotifications ?? true,
    marketingEmails: initialProfile.marketingEmails ?? false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);

      const response = await fetch('/api/users/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Erro ao salvar perfil');
        return;
      }

      toast.success('Perfil atualizado com sucesso!');

      // Refresh the auth context profile, then go back to profile
      await refreshProfile();
      window.location.assign('/profile');
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('Erro ao salvar perfil');
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="cursor-pointer gap-2">
          <Link href="/profile">
            <IconArrowLeft className="h-4 w-4" />
            Voltar ao Perfil
          </Link>
        </Button>
        
        <Button type="submit" disabled={isSaving} className="cursor-pointer gap-2">
          <IconDeviceFloppy className="h-4 w-4" />
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUser className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>
              Suas informações básicas de identificação.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Seu nome completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="displayName">Nome de Exibição</Label>
              <Input
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="Como você quer ser chamado"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Conte um pouco sobre você"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBriefcase className="h-5 w-5" />
              Informações Profissionais
            </CardTitle>
            <CardDescription>
              Detalhes sobre sua carreira e trabalho.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título / Cargo</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ex: Desenvolvedora, Médico, Designer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Onde você trabalha"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://seusite.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconWorld className="h-5 w-5" />
              Redes Sociais
            </CardTitle>
            <CardDescription>
              Links para seus perfis em redes sociais.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/seuperfil"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter / X</Label>
              <Input
                id="twitter"
                name="twitter"
                value={formData.twitter}
                onChange={handleInputChange}
                placeholder="https://twitter.com/seuperfil"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                name="instagram"
                value={formData.instagram}
                onChange={handleInputChange}
                placeholder="https://instagram.com/seuperfil"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconSettings className="h-5 w-5" />
              Preferências
            </CardTitle>
            <CardDescription>
              Configurações de idioma e notificações.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="pt">Português</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                <option value="America/Manaus">Manaus (GMT-4)</option>
                <option value="America/Noronha">Fernando de Noronha (GMT-2)</option>
                <option value="America/Rio_Branco">Acre (GMT-5)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Receba atualizações sobre seus cursos e eventos.
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={formData.emailNotifications}
                onCheckedChange={(checked) => handleSwitchChange('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="marketingEmails">Emails de Marketing</Label>
                <p className="text-sm text-muted-foreground">
                  Receba novidades, promoções e conteúdo exclusivo.
                </p>
              </div>
              <Switch
                id="marketingEmails"
                checked={formData.marketingEmails}
                onCheckedChange={(checked) => handleSwitchChange('marketingEmails', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button (Mobile) */}
      <div className="flex justify-end md:hidden">
        <Button type="submit" disabled={isSaving} className="cursor-pointer gap-2 w-full">
          <IconDeviceFloppy className="h-4 w-4" />
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  );
}
