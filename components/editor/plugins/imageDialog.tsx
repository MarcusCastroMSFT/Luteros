'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { compressImage, formatFileSize, getCompressionRatio } from '@/lib/image-compression';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (url: string, altText?: string) => void;
}

export function ImageDialog({ open, onOpenChange, onConfirm }: ImageDialogProps) {
  const [url, setUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setUrl('');
    setAltText('');
    setIsUploading(false);
    setIsDragging(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (url.trim()) {
      onConfirm(url.trim(), altText.trim() || undefined);
      reset();
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  // Compress the chosen file client-side, upload to Vercel Blob via /api/upload,
  // and store the returned URL (never a data URL) so article rows stay small.
  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem válido.');
      return;
    }
    setIsUploading(true);
    try {
      const compressed = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.9,
        maxSizeMB: 5,
        convertToFormat: 'jpeg',
      });

      const formData = new FormData();
      formData.append('file', compressed.file);
      formData.append('folder', 'articles');

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Upload falhou (${res.status})`);
      }
      const { url: uploadedUrl } = (await res.json()) as { url: string };

      const ratio = getCompressionRatio(compressed.originalSize, compressed.compressedSize);
      toast.success(
        `Imagem enviada! ${formatFileSize(compressed.originalSize)} → ${formatFileSize(compressed.compressedSize)} (${ratio}% menor)`,
      );
      setUrl(uploadedUrl);
    } catch (err) {
      console.error('Image upload error:', err);
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar a imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inserir Imagem</DialogTitle>
          <DialogDescription>
            Faça upload de uma imagem ou cole a URL para inserir no editor.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" type="button">Fazer upload</TabsTrigger>
              <TabsTrigger value="url" type="button">Usar URL</TabsTrigger>
            </TabsList>

            {/* Upload tab */}
            <TabsContent value="upload" className="space-y-2">
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-border'
                } ${isUploading ? 'pointer-events-none opacity-70' : 'cursor-pointer hover:bg-muted/50'}`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Enviando imagem...</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Clique para selecionar ou arraste uma imagem aqui
                    </p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, WEBP ou GIF (máx. 5MB)</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </TabsContent>

            {/* URL tab */}
            <TabsContent value="url" className="space-y-2">
              <Label htmlFor="image-url">URL da Imagem</Label>
              <Input
                id="image-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full"
              />
            </TabsContent>
          </Tabs>

          {/* Preview of the selected/uploaded image */}
          {url && (
            <div className="relative overflow-hidden rounded-lg border border-border bg-muted">
              <div className="relative aspect-video w-full">
                <Image src={url} alt="Pré-visualização" fill className="object-contain" unoptimized />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute right-2 top-2 h-7 w-7 cursor-pointer"
                onClick={() => setUrl('')}
                title="Remover imagem"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="alt-text">Texto Alternativo (opcional)</Label>
            <Input
              id="alt-text"
              type="text"
              placeholder="Descrição da imagem"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="w-full"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button className="cursor-pointer" type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button className="cursor-pointer" type="submit" disabled={!url.trim() || isUploading}>
              Inserir Imagem
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
