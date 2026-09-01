'use client';

import { ChangeEvent, useCallback, useRef, useState } from 'react';
import { Headphones, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { readAudioFileDuration } from '@/lib/audio-duration';
import { validateCourseMediaDeclaration } from '@/lib/course-media';
import { uploadCourseMedia } from '@/lib/course-media-upload';

interface AudioUploadProps {
  courseId: string;
  lessonId?: string;
  value?: string;
  pendingFile?: File | null;
  onChange: (blobName: string) => void;
  onFileSelected?: (file: File | null) => void;
  onDurationChange?: (duration: number) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  onRemove?: () => void;
}

const ACCEPTED_AUDIO_TYPES = '.mp3,.m4a,.wav,.ogg';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AudioUpload({
  courseId,
  lessonId,
  value,
  pendingFile,
  onChange,
  onFileSelected,
  onDurationChange,
  onUploadingChange,
  onRemove,
}: AudioUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    const validation = validateCourseMediaDeclaration({
      kind: 'lesson-audio',
      contentType: file.type,
      size: file.size,
    });
    if (!validation.ok) {
      toast.error(validation.error);
      return;
    }

    try {
      onDurationChange?.(await readAudioFileDuration(file));
    } catch {
      // Duration remains editable when metadata is unavailable.
    }

    if (!lessonId) {
      onFileSelected?.(file);
      setUploadError(null);
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);
    setIsUploading(true);
    onUploadingChange?.(true);
    setProgress(0);
    setUploadedBytes(0);
    setTotalBytes(file.size);
    setIsFinalizing(false);
    setUploadError(null);

    try {
      const result = await uploadCourseMedia(file, {
        kind: 'lesson-audio',
        courseId,
        lessonId,
        signal: controller.signal,
        onProgress: (loaded, total) => {
          setUploadedBytes(loaded);
          setTotalBytes(total);
          setProgress(Math.round((loaded / total) * 100));
          setIsFinalizing(loaded >= total);
        },
      });
      if (result.kind !== 'lesson-audio') throw new Error('Invalid upload result');

      onChange(result.blobName);
      toast.success('Áudio enviado com sucesso!');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        toast.info('Upload cancelado.');
      } else {
        const message = error instanceof Error ? error.message : 'Erro ao enviar o áudio.';
        setUploadError(message);
        toast.error(message);
      }
    } finally {
      setIsUploading(false);
      onUploadingChange?.(false);
      setAbortController(null);
    }
  }, [courseId, lessonId, onChange, onDurationChange, onFileSelected, onUploadingChange]);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void handleUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [handleUpload]);

  const handleRemove = useCallback(() => {
    if (pendingFile) onFileSelected?.(null);
    onRemove?.();
  }, [onFileSelected, onRemove, pendingFile]);

  return (
    <div>
      <Label>Áudio</Label>
      <div className="mt-2 space-y-4">
        {(value || pendingFile) && !isUploading && (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
            <Headphones className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 truncate text-sm">
              {pendingFile ? `${pendingFile.name} (será enviado ao criar a aula)` : 'Áudio carregado'}
            </span>
            <Button type="button" variant="ghost" size="icon" onClick={handleRemove} aria-label="Remover áudio">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {!value && !pendingFile && !isUploading && (
          <div
            className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              const file = event.dataTransfer.files[0];
              if (file) void handleUpload(file);
            }}
          >
            <Upload className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">MP3, M4A, WAV ou OGG</p>
            <p className="mb-4 text-xs text-muted-foreground">Máximo 500 MB</p>
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              Selecionar arquivo
            </Button>
            <Input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_AUDIO_TYPES}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {isUploading && (
          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm" aria-live="polite">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isFinalizing ? 'Finalizando áudio...' : 'Enviando áudio...'}
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={() => abortController?.abort()}>
                Cancelar
              </Button>
            </div>
            <Progress value={progress} className="h-2" aria-label="Progresso do upload do áudio" />
            <div className="flex justify-between text-xs tabular-nums text-muted-foreground">
              <span>{formatFileSize(uploadedBytes)} de {formatFileSize(totalBytes)}</span>
              <span>{progress}%</span>
            </div>
          </div>
        )}

        {uploadError && !isUploading && (
          <Alert variant="destructive">
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}