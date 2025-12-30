'use client';

import { useState } from 'react';
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
  eventDate: Date | undefined;
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

interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateEventModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    slug: '',
    description: '',
    fullDescription: '',
    location: '',
    eventDate: undefined,
    eventTime: '',
    duration: '',
    image: '',
    totalSlots: '',
    cost: '',
    isFree: true,
    isPublished: false,
    isCancelled: false,
    speakers: [],
  });

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
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
      if (!formData.totalSlots || parseInt(formData.totalSlots) <= 0) {
        throw new Error('Número de vagas deve ser maior que zero');
      }

      const payload = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        fullDescription: formData.fullDescription,
        location: formData.location,
        eventDate: formData.eventDate.toISOString().split('T')[0],
        eventTime: formData.eventTime,
        duration: formData.duration,
        image: formData.image,
        totalSlots: parseInt(formData.totalSlots),
        cost: formData.isFree ? '0' : formData.cost,
        isFree: formData.isFree,
        isPublished: formData.isPublished,
        isCancelled: formData.isCancelled,
        speakers: formData.speakers.filter(s => s.name.trim() !== ''),
      };

      const response = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha ao criar evento');
      }

      toast.success('Evento criado com sucesso!');
      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      setFormData({
        title: '',
        slug: '',
        description: '',
        fullDescription: '',
        location: '',
        eventDate: undefined,
        eventTime: '',
        duration: '',
        image: '',
        totalSlots: '',
        cost: '',
        isFree: true,
        isPublished: false,
        isCancelled: false,
        speakers: [],
      });
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err instanceof Error ? err.message : 'Falha ao criar evento');
      toast.error(err instanceof Error ? err.message : 'Falha ao criar evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Evento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Title and Slug */}
          <div className="grid gap-4 sm:grid-cols-2">
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
            <div className="space-y-2">
              <Label htmlFor="slug">
                Slug <span className="text-red-500">*</span>
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="url-amigavel"
                required
              />
            </div>
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
              rows={2}
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
              rows={4}
            />
          </div>

          {/* Location and Date */}
          <div className="grid gap-4 sm:grid-cols-2">
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
            <div className="space-y-2">
              <Label>
                Data do Evento <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal cursor-pointer',
                      !formData.eventDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.eventDate ? (
                      format(formData.eventDate, 'PPP', { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.eventDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, eventDate: date }))}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Time and Duration */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="eventTime">
                Horário <span className="text-red-500">*</span>
              </Label>
              <Input
                id="eventTime"
                type="time"
                value={formData.eventTime}
                onChange={(e) => setFormData(prev => ({ ...prev, eventTime: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="120"
              />
            </div>
          </div>

          {/* Image */}
          <div className="space-y-2">
            <Label>Imagem do Evento</Label>
            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
              aspectRatio={16 / 9}
            />
          </div>

          {/* Slots and Cost */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="totalSlots">
                Vagas Totais <span className="text-red-500">*</span>
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
            <div className="space-y-2">
              <Label htmlFor="cost">Preço</Label>
              <Input
                id="cost"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                placeholder="0"
                disabled={formData.isFree}
                min="0"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="isFree" className="cursor-pointer">Evento Gratuito</Label>
              <Switch
                id="isFree"
                checked={formData.isFree}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFree: checked, cost: checked ? '0' : prev.cost }))}
                className="cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isPublished" className="cursor-pointer">Publicado</Label>
              <Switch
                id="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
                className="cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isCancelled" className="cursor-pointer">Cancelado</Label>
              <Switch
                id="isCancelled"
                checked={formData.isCancelled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isCancelled: checked }))}
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* Speakers Section */}
          <div className="space-y-4">
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

          <DialogFooter>
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
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Evento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
