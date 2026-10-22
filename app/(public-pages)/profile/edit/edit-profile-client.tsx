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
import { formatCpfCnpj, isValidCpfCnpj } from '@/lib/cpf-cnpj';

interface EditProfileClientProps {
  initialProfile: UserProfileData;
}

const cardClass = 'rounded-[12px_32px_12px_12px] border-brand-600/15 bg-white/60 shadow-none';
const cardTitleClass = 'flex items-center gap-2 font-[family-name:var(--font-cardo)] text-2xl font-normal text-brand-900';
const formFieldStyles = [
  '[&_label]:text-base [&_label]:font-medium [&_label]:text-brand-900',
  '[&_input]:h-12 [&_input]:border-brand-600/25 [&_input]:bg-background [&_input]:text-base',
  '[&_textarea]:border-brand-600/25 [&_textarea]:bg-background [&_textarea]:text-base',
].join(' ');

export function EditProfileClient({ initialProfile }: EditProfileClientProps) {
  const { refreshProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [cpfCnpjError, setCpfCnpjError] = useState<string | null>(null);

  // Form state seeded from SSR-fetched profile
  const [formData, setFormData] = useState({
    fullName: initialProfile.fullName || '',
    displayName: initialProfile.displayName || '',
    bio: initialProfile.bio || '',
    phone: initialProfile.phone || '',
    cpfCnpj: initialProfile.cpfCnpj ? formatCpfCnpj(initialProfile.cpfCnpj) : '',
    dateOfBirth: initialProfile.dateOfBirth ? initialProfile.dateOfBirth.split('T')[0] : '',
    title: initialProfile.title || '',
    company: initialProfile.company || '',
    website: initialProfile.website || '',
    linkedin: initialProfile.linkedin || '',
    twitter: initialProfile.twitter || '',
    instagram: initialProfile.instagram || '',
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

    if (formData.cpfCnpj && !isValidCpfCnpj(formData.cpfCnpj)) {
      setCpfCnpjError('Informe um CPF ou CNPJ válido.');
      return;
    }
    
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
    <form onSubmit={handleSubmit} className={`space-y-8 ${formFieldStyles}`} noValidate>
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="cursor-pointer gap-2 text-brand-700 hover:bg-brand-50 hover:text-brand-700">
          <Link href="/profile">
            <IconArrowLeft className="h-4 w-4" />
            Voltar ao Perfil
          </Link>
        </Button>
        
        <Button type="submit" disabled={isSaving} className="cursor-pointer gap-2 bg-brand-600 shadow-none hover:bg-brand-700">
          <IconDeviceFloppy className="h-4 w-4" />
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className={cardTitleClass}>
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
              <Label htmlFor="cpfCnpj">CPF ou CNPJ</Label>
              <Input
                id="cpfCnpj"
                name="cpfCnpj"
                inputMode="numeric"
                autoComplete="off"
                value={formData.cpfCnpj}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, cpfCnpj: formatCpfCnpj(e.target.value) }));
                  setCpfCnpjError(null);
                }}
                placeholder="000.000.000-00"
                aria-invalid={cpfCnpjError ? true : undefined}
              />
              {cpfCnpjError ? (
                <p className="text-sm text-red-600">{cpfCnpjError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Usado para emitir a cobrança na compra de cursos.</p>
              )}
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
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className={cardTitleClass}>
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
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className={cardTitleClass}>
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
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className={cardTitleClass}>
              <IconSettings className="h-5 w-5" />
              Preferências
            </CardTitle>
            <CardDescription>
              Escolha quais notificações deseja receber.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
        <Button type="submit" disabled={isSaving} className="w-full cursor-pointer gap-2 bg-brand-600 shadow-none hover:bg-brand-700">
          <IconDeviceFloppy className="h-4 w-4" />
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  );
}
