'use client';

import { useState, useRef, useCallback, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Loader2, Video } from 'lucide-react';
import { toast } from 'sonner';
import { uploadCourseMedia, type CourseMediaUploadResult } from '@/lib/course-media-upload';
import { validateCourseMediaDeclaration } from '@/lib/course-media';
import { readVideoFileDuration } from '@/lib/video-duration';

interface VideoUploadProps {
  courseId: string;
  lessonId?: string;
  value?: string; // blobName
  pendingFile?: File | null;
  onChange: (blobName: string) => void;
  onFileSelected?: (file: File | null) => void;
  onDurationChange?: (duration: number) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  onRemove?: () => void;
  label?: string;
  description?: string;
  allowRemove?: boolean;
  className?: string;
}

const ACCEPTED_VIDEO_TYPES = '.mp4,.webm,.mov';
const MAX_VIDEO_SIZE_LABEL = '2 GB';
type UploadPhase = 'preparing' | 'uploading' | 'finalizing';

const UPLOAD_PHASE_LABELS: Record<UploadPhase, string> = {
  preparing: 'Preparando upload...',
  uploading: 'Enviando vídeo...',
  finalizing: 'Finalizando vídeo...',
};

function _formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function _formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}:${String(secs).padStart(2, '0')}`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}:${String(remainingMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function VideoUpload({
  courseId,
  lessonId,
  value,
  pendingFile,
  onChange,
  onFileSelected,
  onDurationChange,
  onUploadingChange,
  onRemove,
  label = 'Vídeo',
  description = 'Faça upload de um arquivo de vídeo (.mp4, .webm, .mov)',
  allowRemove = true,
  className = '',
}: VideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [uploadTotalBytes, setUploadTotalBytes] = useState(0);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>('preparing');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      const validation = validateCourseMediaDeclaration({
        kind: 'lesson-video',
        contentType: file.type,
        size: file.size,
      });
      if (!validation.ok) {
        toast.error(validation.error);
        return;
      }

      try {
        onDurationChange?.(await readVideoFileDuration(file));
      } catch {
        // Duration remains editable when the browser cannot read the metadata.
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
      setUploadProgress(0);
      setUploadedBytes(0);
      setUploadTotalBytes(file.size);
      setUploadPhase('preparing');
      setUploadError(null);

      try {
        const result: CourseMediaUploadResult = await uploadCourseMedia(file, {
          kind: 'lesson-video',
          courseId,
          lessonId,
          signal: controller.signal,
          onProgress: (loaded, total) => {
            setUploadedBytes(loaded);
            setUploadTotalBytes(total);
            setUploadProgress(Math.round((loaded / total) * 100));
            setUploadPhase(loaded >= total ? 'finalizing' : 'uploading');
          },
        });

        if (result.kind !== 'lesson-video') {
          throw new Error('Invalid upload result');
        }

        toast.success('Vídeo enviado com sucesso!');
        onChange(result.blobName);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          toast.info('Upload cancelado.');
        } else {
          const message = err instanceof Error ? err.message : 'Erro ao enviar o vídeo.';
          setUploadError(message);
          toast.error(message);
        }
      } finally {
        setIsUploading(false);
        onUploadingChange?.(false);
        setUploadProgress(0);
        setAbortController(null);
      }
    },
    [courseId, lessonId, onChange, onDurationChange, onFileSelected, onUploadingChange]
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [handleUpload]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleCancel = useCallback(() => {
    if (abortController) {
      abortController.abort();
    }
  }, [abortController]);

  const handleRemove = useCallback(() => {
    if (pendingFile) {
      onFileSelected?.(null);
    }
    if (onRemove) {
      onRemove();
    }
  }, [onFileSelected, onRemove, pendingFile]);

  if (!lessonId && !onFileSelected) {
    return (
      <div className={className}>
        <Label>{label}</Label>
        <Alert>
          <AlertDescription>
            Salve a aula primeiro para habilitar o upload de vídeo.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={className}>
      <Label>{label}</Label>
      <div className="mt-2 space-y-4">
        {/* Current video indicator */}
        {(value || pendingFile) && !isUploading && (
          <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
            <Video className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm flex-1 truncate">
              {pendingFile ? `${pendingFile.name} (será enviado ao criar a aula)` : 'Vídeo carregado'}
            </span>
            {allowRemove && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Upload area */}
        {!value && !pendingFile && !isUploading && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">{description}</p>
            <p className="text-xs text-muted-foreground mb-4">
              Máximo {MAX_VIDEO_SIZE_LABEL}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Selecionar arquivo
            </Button>
            <Input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_VIDEO_TYPES}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* Upload progress */}
        {isUploading && (
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm" aria-live="polite">
                  {UPLOAD_PHASE_LABELS[uploadPhase]}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
              >
                Cancelar
              </Button>
            </div>
            <div className="relative overflow-hidden rounded-full">
              <Progress
                value={uploadProgress}
                className="h-2"
                aria-label="Progresso do upload do vídeo"
                aria-valuetext={`${uploadProgress}% enviado`}
              />
              <div
                className="upload-progress-activity pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-primary/70 to-transparent"
                aria-hidden="true"
              />
            </div>
            <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground tabular-nums">
              <span>
                {_formatFileSize(uploadedBytes)} de {_formatFileSize(uploadTotalBytes)}
              </span>
              <span>{uploadProgress}%</span>
            </div>
          </div>
        )}

        {/* Error state */}
        {uploadError && !isUploading && (
          <Alert variant="destructive">
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
