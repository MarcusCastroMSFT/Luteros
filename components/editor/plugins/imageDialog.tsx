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

interface ImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (url: string, altText?: string) => void;
}

export function ImageDialog({ open, onOpenChange, onConfirm }: ImageDialogProps) {
  const [url, setUrl] = useState('');
  const [altText, setAltText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onConfirm(url.trim(), altText.trim() || undefined);
      setUrl('');
      setAltText('');
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setUrl('');
    setAltText('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inserir Imagem</DialogTitle>
          <DialogDescription>
            Digite a URL da imagem que deseja inserir no editor.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-url">URL da Imagem</Label>
            <Input
              id="image-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full"
            />
          </div>
          
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
            <Button className='cursor-pointer' type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button className='cursor-pointer'  type="submit" disabled={!url.trim()}>
              Inserir Imagem
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
