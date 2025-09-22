'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface VideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (url: string) => void;
}

export function VideoDialog({ open, onOpenChange, onConfirm }: VideoDialogProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onConfirm(url.trim());
      setUrl('');
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setUrl('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inserir Vídeo</DialogTitle>
          <DialogDescription>
            Digite a URL do vídeo (YouTube ou Vimeo) que deseja inserir no editor.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-url">URL do Vídeo</Label>
            <Input
              id="video-url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full"
            />
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button className='cursor-pointer' type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button className='cursor-pointer' type="submit" disabled={!url.trim()}>
              Inserir Vídeo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
