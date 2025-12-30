'use client';

import { useEffect, useState } from 'react';
import { Loader2, CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ImageUpload } from '@/components/common/image-upload';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Speaker {
  id?: string;
  name: string;
  title: string;
  bio: string;
  image: string;
  linkedin: string;
  twitter: string;
  website: string;
  order: number;
}

interface EventFormData {
  title: string;
  slug: string;
  description: string;
  fullDescription: string;
  location: string;
  eventDate: string;
  eventTime: string;
  duration: string;
  image: string;
  totalSlots: string;
  cost: string;
  isFree: boolean;
  isPublished: boolean;
  isCancelled: boolean;
  speakers: Speaker[];
}

interface EditEventModalProps {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditEventModal({
  eventId,
  open,
  onOpenChange,
  onSuccess,
}: EditEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    slug: '',
    description: '',
    fullDescription: '',
    location: '',
    eventDate: '',
    eventTime: '',
    duration: '',
    image: '',
    totalSlots: '',
    cost: '',
    isFree: false,
    isPublished: false,
    isCancelled: false,
    speakers: [],
  });

  useEffect(() => {
    if (open && eventId) {
      fetchEvent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, eventId]);

  const fetchEvent = async () => {
    setLoadingData(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/events/${eventId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha ao buscar evento');
      }

      const event = data.data;
      
      // Format date for input (YYYY-MM-DD)
      const eventDate = new Date(event.eventDate);
      const formattedDate = eventDate.toISOString().split('T')[0];

      setFormData({
        title: event.title,
        slug: event.slug,
        description: event.description,
        fullDescription: event.fullDescription || '',
        location: event.location,
        eventDate: formattedDate,
        eventTime: event.eventTime,
        duration: event.duration?.toString() || '',
        image: event.image || '',
        totalSlots: event.totalSlots.toString(),
        cost: event.cost || '',
        isFree: event.isFree,
        isPublished: event.isPublished,
        isCancelled: event.isCancelled,
        speakers: (event.speakers || []).map((speaker: { id: string; name: string | null; title: string | null; bio: string | null; image: string | null; linkedin: string | null; twitter: string | null; website: string | null; order: number }) => ({
          id: speaker.id,
          name: speaker.name || '',
          title: speaker.title || '',
          bio: speaker.bio || '',
          image: speaker.image || '',
          linkedin: speaker.linkedin || '',
          twitter: speaker.twitter || '',
          website: speaker.website || '',
          order: speaker.order || 0,
        })),
      });
    } catch (err) {
      console.error('Error fetching event:', err);
      setError(err instanceof Error ? err.message : 'Falha ao carregar evento');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error('Título é obrigatório');
      }
      if (!formData.location.trim()) {
        throw new Error('Local é obrigatório');
      }
      if (!formData.eventDate) {
        throw new Error('Data é obrigatória');
      }
      if (!formData.eventTime) {
        throw new Error('Horário é obrigatório');
      }
      if (!formData.totalSlots || parseInt(formData.totalSlots) < 1) {
        throw new Error('Total de vagas deve ser maior que 0');
      }

      const payload = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        fullDescription: formData.fullDescription || null,
        location: formData.location,
        eventDate: new Date(formData.eventDate).toISOString(),
        eventTime: formData.eventTime,
        duration: formData.duration ? parseInt(formData.duration) : null,
        image: formData.image || null,
        totalSlots: parseInt(formData.totalSlots),
        cost: formData.isFree ? null : (formData.cost ? parseFloat(formData.cost) : null),
        isFree: formData.isFree,
        isPublished: formData.isPublished,
        isCancelled: formData.isCancelled,
        speakers: formData.speakers.filter(s => s.name.trim() !== ''),
      };

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha ao atualizar evento');
      }

      toast.success('Evento atualizado com sucesso!');
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error('Error updating event:', err);
      setError(err instanceof Error ? err.message : 'Falha ao atualizar evento');
      toast.error(err instanceof Error ? err.message : 'Falha ao atualizar evento');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: generateSlug(value),
    }));
  };

  const addSpeaker = () => {
    setFormData(prev => ({
      ...prev,
      speakers: [
        ...prev.speakers,
        {
          name: '',
          title: '',
          bio: '',
          image: '',
          linkedin: '',
          twitter: '',
          website: '',
          order: prev.speakers.length + 1,
        },
      ],
    }));
  };

  const removeSpeaker = (index: number) => {
    setFormData(prev => ({
      ...prev,
      speakers: prev.speakers.filter((_, i) => i !== index),
    }));
  };

  const updateSpeaker = (index: number, field: keyof Speaker, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      speakers: prev.speakers.map((speaker, i) =>
        i === index ? { ...speaker, [field]: value } : speaker
      ),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Título <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Nome do evento"
                  required
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="slug-do-evento"
                />
                <p className="text-xs text-muted-foreground">
                  URL amigável gerada automaticamente
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Descrição Curta <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Breve descrição do evento"
                  rows={3}
                  required
                />
              </div>

              {/* Full Description */}
              <div className="space-y-2">
                <Label htmlFor="fullDescription">Descrição Completa</Label>
                <Textarea
                  id="fullDescription"
                  value={formData.fullDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullDescription: e.target.value }))}
                  placeholder="Descrição detalhada do evento"
                  rows={5}
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">
                  Local <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Cidade, Estado"
                  required
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>
                    Data <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal cursor-pointer",
                          !formData.eventDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.eventDate ? (
                          format(new Date(formData.eventDate), "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione a data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.eventDate ? new Date(formData.eventDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const formattedDate = format(date, 'yyyy-MM-dd');
                            setFormData(prev => ({ ...prev, eventDate: formattedDate }));
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventTime">
                    Horário <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="eventTime"
                    value={formData.eventTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventTime: e.target.value }))}
                    placeholder="09:00 - 18:00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="480"
                  />
                </div>
              </div>

              {/* Total Slots */}
              <div className="space-y-2">
                <Label htmlFor="totalSlots">
                  Total de Vagas <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="totalSlots"
                  type="number"
                  value={formData.totalSlots}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalSlots: e.target.value }))}
                  placeholder="100"
                  min="1"
                  required
                />
              </div>

              {/* Image */}
              <div className="space-y-2">
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                  onRemove={() => setFormData(prev => ({ ...prev, image: '' }))}
                  label="Imagem do Evento"
                  description="Imagem principal (recomendado: 1200x675px)"
                  aspectRatio={16 / 9}
                  maxSizeMB={5}
                />
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFree"
                    checked={formData.isFree}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFree: checked }))}
                    className="cursor-pointer"
                  />
                  <Label htmlFor="isFree" className="cursor-pointer">
                    Evento Gratuito
                  </Label>
                </div>

                {!formData.isFree && (
                  <div className="space-y-2">
                    <Label htmlFor="cost">Valor (R$)</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>

              {/* Speakers Section */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Palestrantes</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSpeaker}
                    className="cursor-pointer"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Palestrante
                  </Button>
                </div>

                {formData.speakers.map((speaker, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSpeaker(index)}
                      className="absolute top-2 right-2 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </Button>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input
                          value={speaker.name}
                          onChange={(e) => updateSpeaker(index, 'name', e.target.value)}
                          placeholder="Nome do palestrante"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Título/Cargo</Label>
                        <Input
                          value={speaker.title}
                          onChange={(e) => updateSpeaker(index, 'title', e.target.value)}
                          placeholder="Ex: Médico, Nutricionista"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Bio</Label>
                      <Textarea
                        value={speaker.bio}
                        onChange={(e) => updateSpeaker(index, 'bio', e.target.value)}
                        placeholder="Breve biografia"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Imagem URL</Label>
                      <Input
                        value={speaker.image}
                        onChange={(e) => updateSpeaker(index, 'image', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label>LinkedIn</Label>
                        <Input
                          value={speaker.linkedin}
                          onChange={(e) => updateSpeaker(index, 'linkedin', e.target.value)}
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Twitter</Label>
                        <Input
                          value={speaker.twitter}
                          onChange={(e) => updateSpeaker(index, 'twitter', e.target.value)}
                          placeholder="https://twitter.com/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Website</Label>
                        <Input
                          value={speaker.website}
                          onChange={(e) => updateSpeaker(index, 'website', e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {formData.speakers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum palestrante adicionado. Clique no botão acima para adicionar.
                  </p>
                )}
              </div>

              {/* Status Switches */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
                    className="cursor-pointer"
                  />
                  <Label htmlFor="isPublished" className="cursor-pointer">
                    Publicar Evento
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isCancelled"
                    checked={formData.isCancelled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isCancelled: checked }))}
                    className="cursor-pointer"
                  />
                  <Label htmlFor="isCancelled" className="cursor-pointer">
                    Evento Cancelado
                  </Label>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="cursor-pointer">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
