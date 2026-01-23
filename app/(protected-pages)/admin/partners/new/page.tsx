'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { IconLoader2, IconArrowLeft, IconEye } from '@tabler/icons-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/common/image-upload';
import Image from 'next/image';

export default function NewPartnerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  
  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logo, setLogo] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    const generatedSlug = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      setError('Nome é obrigatório');
      return;
    }
    if (!slug.trim()) {
      setError('Slug é obrigatório');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          slug,
          logo: logo || null,
          website: website || null,
          description: description || null,
          email: email || null,
          phone: phone || null,
          isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao criar parceiro');
      }

      toast.success('Parceiro criado com sucesso!');
      router.push('/admin/partners');
    } catch (err) {
      console.error('Error creating partner:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar parceiro';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Page Header */}
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="cursor-pointer"
              >
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="cursor-pointer"
              >
                <IconEye className="h-4 w-4 mr-2" />
                {showPreview ? 'Ocultar Preview' : 'Mostrar Preview'}
              </Button>
            </div>
            
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">Novo Parceiro</h1>
              <p className="text-muted-foreground">
                Adicione um novo parceiro ou fornecedor
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="px-4 lg:px-6">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Form and Preview Grid */}
          <div className={`px-4 lg:px-6 ${showPreview ? 'grid grid-cols-1 xl:grid-cols-2 gap-8' : ''}`}>
            <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
              {/* Basic Info Section */}
              <div className="space-y-6">
                <h2 className="text-lg font-medium border-b pb-2">Informações Básicas</h2>
                
                {/* Name and Slug */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Nome <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Nome do parceiro"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">
                      Slug <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="nome-do-parceiro"
                      required
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Identificador único para URLs
                    </p>
                  </div>
                </div>

                {/* Logo */}
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <ImageUpload
                    value={logo}
                    onChange={setLogo}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva o parceiro e seus serviços..."
                    rows={4}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Contact Section */}
              <div className="space-y-6">
                <h2 className="text-lg font-medium border-b pb-2">Contato</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contato@parceiro.com"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://www.parceiro.com"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-6">
                <h2 className="text-lg font-medium border-b pb-2">Status</h2>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    disabled={loading}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Parceiro ativo
                  </Label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer"
                >
                  {loading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Salvando...' : 'Criar Parceiro'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
              </div>
            </form>

            {/* Preview Panel */}
            {showPreview && (
              <div className="xl:sticky xl:top-6 self-start">
                <div className="border rounded-lg p-6 bg-muted/30">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <IconEye className="h-5 w-5" />
                    Preview do Parceiro
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Partner Card Preview */}
                    <div className="bg-background rounded-lg border p-6 space-y-4">
                      {/* Logo and Name */}
                      <div className="flex items-center gap-4">
                        {logo ? (
                          <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                            <Image
                              src={logo}
                              alt={name || 'Parceiro'}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl font-semibold text-primary">
                              {name ? name.charAt(0).toUpperCase() : 'P'}
                            </span>
                          </div>
                        )}
                        <div>
                          <h4 className="text-xl font-semibold">{name || 'Nome do Parceiro'}</h4>
                          <p className="text-sm text-muted-foreground">/{slug || 'slug-do-parceiro'}</p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>

                      {/* Description */}
                      {description && (
                        <div>
                          <p className="text-sm text-muted-foreground">{description}</p>
                        </div>
                      )}

                      {/* Contact Info */}
                      {(email || phone || website) && (
                        <div className="pt-4 border-t space-y-2">
                          {email && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">Email:</span>{' '}
                              <span className="text-primary">{email}</span>
                            </p>
                          )}
                          {phone && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">Telefone:</span>{' '}
                              {phone}
                            </p>
                          )}
                          {website && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">Website:</span>{' '}
                              <span className="text-primary">{website}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
