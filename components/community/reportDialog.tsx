'use client';

import { useState } from 'react';
import { Flag, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => void;
  itemType: 'post' | 'reply';
  itemAuthor?: string;
}

export function ReportDialog({ isOpen, onClose, onSubmit, itemType, itemAuthor }: ReportDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = [
    { id: 'spam', label: 'Spam ou conteúdo promocional não solicitado' },
    { id: 'harassment', label: 'Assédio ou bullying' },
    { id: 'hate', label: 'Discurso de ódio ou discriminação' },
    { id: 'misinformation', label: 'Informações médicas incorretas' },
    { id: 'inappropriate', label: 'Conteúdo inapropriado ou ofensivo' },
    { id: 'privacy', label: 'Violação de privacidade' },
    { id: 'other', label: 'Outro motivo' }
  ];

  const handleSubmit = async () => {
    if (!selectedReason) return;
    
    setIsSubmitting(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSubmit(selectedReason, details);
    
    // Reset form
    setSelectedReason('');
    setDetails('');
    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    setSelectedReason('');
    setDetails('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <Flag size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Reportar {itemType === 'post' ? 'Post' : 'Resposta'}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                {itemAuthor && `De: ${itemAuthor}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">Antes de reportar:</p>
                <p>Reportes falsos podem resultar em suspensão da sua conta. Use esta função apenas para conteúdo que viola nossas diretrizes da comunidade.</p>
              </div>
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
              Motivo do reporte *
            </label>
            <div className="space-y-2">
              {reportReasons.map((reason) => (
                <label
                  key={reason.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedReason === reason.id
                      ? 'border-primary bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.id}
                    checked={selectedReason === reason.id}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mt-1 w-4 h-4 text-primary border-gray-300 dark:border-gray-600 focus:ring-primary dark:bg-gray-700 cursor-pointer"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">{reason.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Detalhes adicionais (opcional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Forneça mais contexto sobre o problema..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {details.length}/500 caracteres
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedReason || isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </div>
              ) : (
                <>
                  <Flag size={16} className="mr-2" />
                  Enviar Reporte
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
