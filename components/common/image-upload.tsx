'use client';

import { useState, useRef, useCallback, ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link as LinkIcon, X, Crop, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { compressImage, formatFileSize, getCompressionRatio } from '@/lib/image-compression';
import { ImageCropper } from './image-cropper';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  description?: string;
  aspectRatio?: number; // e.g., 16/9 for landscape, 1 for square
  maxSizeMB?: number;
  /** Force a circular crop preview (for avatars). Default false = rectangular. */
  round?: boolean;
  /** Subfolder used in the blob storage key (e.g. "articles", "courses"). */
  uploadFolder?: string;
  /** API endpoint that receives the cropped image. */
  uploadUrl?: string;
  /** Optional direct uploader; other callers keep using the multipart endpoint. */
  uploadFile?: (file: File) => Promise<string>;
  allowUrl?: boolean;
  allowRemove?: boolean;
  className?: string;
}

// Read a File or Blob into a data URL
function readAsDataUrl(input: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(input);
  });
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  label = 'Imagem',
  description = 'Faça upload de uma imagem ou cole a URL',
  aspectRatio = 16 / 9,
  maxSizeMB = 5,
  round = false,
  uploadFolder = 'uploads',
  uploadUrl = '/api/upload',
  uploadFile,
  allowUrl = true,
  allowRemove = true,
  className = '',
}: ImageUploadProps) {
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [pendingSource, setPendingSource] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drop a File into the cropper (data-URL form so it's safe to load)
  const openCropperForFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem válido.');
      return;
    }
    try {
      const dataUrl = await readAsDataUrl(file);
      setPendingSource(dataUrl);
      setCropperOpen(true);
    } catch (err) {
      console.error(err);
      toast.error('Não foi possível abrir a imagem.');
    }
  }, []);

  // After the user crops: compress client-side to save bandwidth, upload to
  // Vercel Blob via /api/upload, then store the returned URL (NOT a data URL).
  // Storing URLs instead of base64 keeps DB rows ~500× smaller and avoids
  // re-shipping image bytes with every page render.
  const handleCropComplete = useCallback(
    async (blob: Blob) => {
      setCropperOpen(false);
      setIsProcessing(true);
      try {
        const croppedFile = new File([blob], `crop-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const compressed = await compressImage(croppedFile, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.9,
          maxSizeMB,
          convertToFormat: 'jpeg',
        });

        let url: string;
        if (uploadFile) {
          url = await uploadFile(compressed.file);
        } else {
          const formData = new FormData();
          formData.append('file', compressed.file);
          formData.append('folder', uploadFolder);

          const res = await fetch(uploadUrl, { method: 'POST', body: formData });
          if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            throw new Error(errBody.error || `Upload falhou (${res.status})`);
          }
          ({ url } = (await res.json()) as { url: string });
        }

        const ratio = getCompressionRatio(compressed.originalSize, compressed.compressedSize);
        toast.success(
          `Imagem enviada! ${formatFileSize(compressed.originalSize)} → ${formatFileSize(compressed.compressedSize)} (${ratio}% menor)`,
        );
        onChange(url);
      } catch (err) {
        console.error('Image upload error:', err);
        toast.error(err instanceof Error ? err.message : 'Erro ao enviar a imagem.');
      } finally {
        setIsProcessing(false);
        setPendingSource(null);
      }
    },
    [maxSizeMB, onChange, uploadFile, uploadFolder, uploadUrl],
  );

  // Re-open the cropper using the current value (so users can re-adjust)
  const handleReadjust = useCallback(() => {
    if (!value) return;
    setPendingSource(value);
    setCropperOpen(true);
  }, [value]);

  // File input change handler
  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) openCropperForFile(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [openCropperForFile],
  );

  // Drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) openCropperForFile(file);
    },
    [openCropperForFile],
  );

  // URL handler — fed straight through, no cropping (we'd hit CORS)
  const handleUrlSubmit = useCallback(() => {
    if (!urlInput.trim()) {
      toast.error('Por favor, insira uma URL válida.');
      return;
    }
    try {
      new URL(urlInput);
      onChange(urlInput.trim());
      setUrlInput('');
      toast.success('URL da imagem adicionada!');
    } catch {
      toast.error('URL inválida. Por favor, insira uma URL completa.');
    }
  }, [urlInput, onChange]);

  const handleRemove = useCallback(() => {
    if (onRemove) onRemove();
    else onChange('');
    toast.success('Imagem removida.');
  }, [onChange, onRemove]);

  const paddingBottom = `${(1 / aspectRatio) * 100}%`;

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <div>
          <Label className="text-sm font-medium">{label}</Label>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
      )}

      {value ? (
        <div className="space-y-4">
          {/* Preview */}
          <div
            className={`relative w-full overflow-hidden border border-border bg-muted ${
              round ? 'rounded-full max-w-[200px]' : 'rounded-lg'
            }`}
            style={round ? { aspectRatio: '1 / 1' } : { paddingBottom }}
          >
            <div className="absolute inset-0">
              <Image src={value} alt="Preview" fill className="object-cover" unoptimized />
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReadjust}
              disabled={isProcessing}
              className="cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Crop className="h-4 w-4 mr-2" />
                  Ajustar Imagem
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="cursor-pointer"
            >
              <Upload className="h-4 w-4 mr-2" />
              Substituir
            </Button>
            {allowRemove && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={isProcessing}
                className="cursor-pointer"
              >
                <X className="h-4 w-4 mr-2" />
                Remover
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <Tabs defaultValue="upload" className="w-full">
          {allowUrl && (
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="url" className="cursor-pointer">
                <LinkIcon className="h-4 w-4 mr-2" />
                URL
              </TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="upload" className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              className={`
                relative w-full overflow-hidden rounded-lg border-2 border-dashed transition-colors
                ${isProcessing ? 'cursor-wait' : 'cursor-pointer hover:border-primary/50 hover:bg-muted/50'}
                ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
              `}
              style={{ paddingBottom }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-12 w-12 mb-4 text-primary animate-spin" />
                    <p className="text-sm font-medium mb-1">Processando imagem...</p>
                    <p className="text-xs text-muted-foreground">Cortando e comprimindo</p>
                  </>
                ) : (
                  <>
                    <Upload
                      className={`h-12 w-12 mb-4 transition-colors ${
                        isDragging ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                    <p className="text-sm font-medium mb-1">
                      {isDragging ? 'Solte a imagem aqui' : 'Clique ou arraste uma imagem'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF até {maxSizeMB}MB · Você poderá enquadrar a imagem antes de salvar
                    </p>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          {allowUrl && (
            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-url">URL da Imagem</Label>
                <div className="flex gap-2">
                  <Input
                    id="image-url"
                    type="url"
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleUrlSubmit}
                    disabled={!urlInput.trim()}
                    className="cursor-pointer"
                  >
                    Adicionar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Cole a URL completa de uma imagem online</p>
              </div>
            </TabsContent>
          )}
        </Tabs>
      )}

      {pendingSource && (
        <ImageCropper
          open={cropperOpen}
          onOpenChange={setCropperOpen}
          imageSrc={pendingSource}
          onCropComplete={handleCropComplete}
          aspect={aspectRatio}
          cropShape={round ? 'round' : 'rect'}
          title="Ajustar imagem"
          description="Arraste para reposicionar. Use o controle deslizante para zoom."
        />
      )}
    </div>
  );
}
