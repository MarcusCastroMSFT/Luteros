'use client';

import { useState, useRef, useCallback, ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Upload, Link as LinkIcon, X, ZoomIn, Move, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { compressImage, formatFileSize, getCompressionRatio } from '@/lib/image-compression';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  description?: string;
  aspectRatio?: number; // e.g., 16/9 for landscape, 1 for square
  maxSizeMB?: number;
  className?: string;
}

interface ImageAdjustment {
  zoom: number;
  positionX: number;
  positionY: number;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  label = 'Imagem',
  description = 'Faça upload de uma imagem ou cole a URL',
  aspectRatio = 16 / 9,
  maxSizeMB = 5,
  className = '',
}: ImageUploadProps) {
  const [urlInput, setUrlInput] = useState('');
  const [imageAdjustment, setImageAdjustment] = useState<ImageAdjustment>({
    zoom: 100,
    positionX: 50,
    positionY: 50,
  });
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Handle file selection with compression
  const handleFileSelect = useCallback(
    async (file: File) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione um arquivo de imagem válido.');
        return;
      }

      setIsCompressing(true);
      
      try {
        // Compress the image
        const result = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.85,
          maxSizeMB: maxSizeMB,
          convertToFormat: file.type === 'image/png' ? 'png' : 'jpeg',
        });

        // Show compression stats
        const compressionRatio = getCompressionRatio(result.originalSize, result.compressedSize);
        
        toast.success(
          `Imagem otimizada! ${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)} (${compressionRatio}% menor)`
        );

        // Update with compressed image data URL
        onChange(result.dataUrl);
      } catch (error) {
        console.error('Image compression error:', error);
        toast.error(
          error instanceof Error 
            ? error.message 
            : 'Erro ao comprimir a imagem. Tente novamente.'
        );
      } finally {
        setIsCompressing(false);
      }
    },
    [maxSizeMB, onChange]
  );

  // Handle file input change
  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  // Handle drag and drop
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
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  // Handle URL input
  const handleUrlSubmit = useCallback(() => {
    if (!urlInput.trim()) {
      toast.error('Por favor, insira uma URL válida.');
      return;
    }

    // Basic URL validation
    try {
      new URL(urlInput);
      onChange(urlInput.trim());
      setUrlInput('');
      toast.success('URL da imagem adicionada!');
    } catch {
      toast.error('URL inválida. Por favor, insira uma URL completa.');
    }
  }, [urlInput, onChange]);

  // Handle image removal
  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove();
    } else {
      onChange('');
    }
    setImageAdjustment({ zoom: 100, positionX: 50, positionY: 50 });
    setIsAdjusting(false);
    toast.success('Imagem removida.');
  }, [onChange, onRemove]);

  // Calculate container aspect ratio
  const paddingBottom = `${(1 / aspectRatio) * 100}%`;

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <div>
          <Label className="text-sm font-medium">{label}</Label>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}

      {value ? (
        <div className="space-y-4">
          {/* Image Preview */}
          <div
            className="relative w-full overflow-hidden rounded-lg border border-border bg-muted"
            style={{ paddingBottom }}
          >
            <div className="absolute inset-0">
              <Image
                src={value}
                alt="Preview"
                fill
                className="object-cover"
                style={{
                  objectPosition: isAdjusting
                    ? `${imageAdjustment.positionX}% ${imageAdjustment.positionY}%`
                    : 'center',
                  transform: isAdjusting
                    ? `scale(${imageAdjustment.zoom / 100})`
                    : 'none',
                }}
              />
            </div>
          </div>

          {/* Image Controls */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAdjusting(!isAdjusting)}
              className="cursor-pointer"
            >
              {isAdjusting ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Concluir Ajuste
                </>
              ) : (
                <>
                  <Move className="h-4 w-4 mr-2" />
                  Ajustar Imagem
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="cursor-pointer"
            >
              <X className="h-4 w-4 mr-2" />
              Remover
            </Button>
          </div>

          {/* Image Adjustment Controls */}
          {isAdjusting && (
            <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm flex items-center gap-2">
                    <ZoomIn className="h-4 w-4" />
                    Zoom
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {imageAdjustment.zoom}%
                  </span>
                </div>
                <Slider
                  value={[imageAdjustment.zoom]}
                  onValueChange={(values) =>
                    setImageAdjustment((prev) => ({ ...prev, zoom: values[0] }))
                  }
                  min={100}
                  max={200}
                  step={5}
                  className="cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm flex items-center gap-2">
                    <Move className="h-4 w-4" />
                    Posição Horizontal
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {imageAdjustment.positionX}%
                  </span>
                </div>
                <Slider
                  value={[imageAdjustment.positionX]}
                  onValueChange={(values) =>
                    setImageAdjustment((prev) => ({
                      ...prev,
                      positionX: values[0],
                    }))
                  }
                  min={0}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm flex items-center gap-2">
                    <Move className="h-4 w-4" />
                    Posição Vertical
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {imageAdjustment.positionY}%
                  </span>
                </div>
                <Slider
                  value={[imageAdjustment.positionY]}
                  onValueChange={(values) =>
                    setImageAdjustment((prev) => ({
                      ...prev,
                      positionY: values[0],
                    }))
                  }
                  min={0}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setImageAdjustment({ zoom: 100, positionX: 50, positionY: 50 })
                }
                className="w-full cursor-pointer"
              >
                Resetar Ajustes
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Tabs defaultValue="upload" className="w-full">
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

          <TabsContent value="upload" className="space-y-4">
            {/* File Input (hidden) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Drag and Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isCompressing && fileInputRef.current?.click()}
              className={`
                relative w-full overflow-hidden rounded-lg border-2 border-dashed
                transition-colors
                ${isCompressing ? 'cursor-wait' : 'cursor-pointer hover:border-primary/50 hover:bg-muted/50'}
                ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
              `}
              style={{ paddingBottom }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                {isCompressing ? (
                  <>
                    <Loader2 className="h-12 w-12 mb-4 text-primary animate-spin" />
                    <p className="text-sm font-medium mb-1">
                      Otimizando imagem...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Comprimindo para melhor performance
                    </p>
                  </>
                ) : (
                  <>
                    <Upload
                      className={`h-12 w-12 mb-4 transition-colors ${
                        isDragging ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                    <p className="text-sm font-medium mb-1">
                      {isDragging
                        ? 'Solte a imagem aqui'
                        : 'Clique ou arraste uma imagem'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF até {maxSizeMB}MB · Otimização automática
                    </p>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

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
              <p className="text-xs text-muted-foreground">
                Cole a URL completa de uma imagem online
              </p>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
