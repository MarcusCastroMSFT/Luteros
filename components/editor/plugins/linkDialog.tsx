'use client';

import { useState, useEffect } from 'react';
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

interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (url: string, text?: string) => void;
  selectedText?: string;
}

export function LinkDialog({ open, onOpenChange, onConfirm, selectedText }: LinkDialogProps) {
  const [url, setUrl] = useState('');
  const [text, setText] = useState(selectedText || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onConfirm(url.trim(), text.trim() || undefined);
      setUrl('');
      setText('');
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setUrl('');
    setText(selectedText || '');
    onOpenChange(false);
  };

  // Update text when selectedText changes and dialog opens
  useEffect(() => {
    if (open && selectedText !== undefined) {
      setText(selectedText);
    }
  }, [open, selectedText]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inserir Link</DialogTitle>
          <DialogDescription>
            {selectedText 
              ? 'Configure o link para o texto selecionado.'
              : 'Digite a URL e o texto do link que deseja inserir no editor.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="link-url">URL do Link</Label>
            <Input
              id="link-url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>
          
          {!selectedText && (
            <div className="space-y-2">
              <Label htmlFor="link-text">Texto do Link</Label>
              <Input
                id="link-text"
                type="text"
                placeholder="Texto que será exibido"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full"
              />
            </div>
          )}
          
          {selectedText && (
            <div className="space-y-2">
              <Label htmlFor="selected-text">Texto Selecionado</Label>
              <Input
                id="selected-text"
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full"
                placeholder="Edite o texto do link"
              />
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button className='cursor-pointer'  type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button className='cursor-pointer'  type="submit" disabled={!url.trim()}>
              {selectedText ? 'Aplicar Link' : 'Inserir Link'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
