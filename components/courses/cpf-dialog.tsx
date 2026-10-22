'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isValidCpfCnpj, formatCpfCnpj, normalizeCpfCnpj } from '@/lib/cpf-cnpj';

interface CpfDialogProps {
  open: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (cpfCnpj: string) => void;
}

export function CpfDialog({ open, isSubmitting, onOpenChange, onSubmit }: CpfDialogProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValidCpfCnpj(value)) {
      setError('Informe um CPF ou CNPJ válido.');
      return;
    }
    setError(null);
    onSubmit(normalizeCpfCnpj(value));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <DialogHeader>
            <DialogTitle>Dados para o pagamento</DialogTitle>
            <DialogDescription>
              Precisamos do seu CPF ou CNPJ para emitir a cobrança. Você escolherá Pix, boleto ou cartão na próxima etapa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="cpf-cnpj">CPF ou CNPJ</Label>
            <Input
              id="cpf-cnpj"
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              value={value}
              onChange={(event) => {
                setValue(formatCpfCnpj(event.target.value));
                setError(null);
              }}
              aria-invalid={error ? true : undefined}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Processando...' : 'Continuar para o pagamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
