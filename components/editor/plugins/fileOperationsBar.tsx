'use client';

import { Upload, FileText, Download, Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFileOperations } from './filePlugin';

interface FileOperationsBarProps {
  isPreviewMode?: boolean;
  onTogglePreview?: () => void;
}

export function FileOperationsBar({ isPreviewMode = false, onTogglePreview }: FileOperationsBarProps) {
  const { importFromFile, exportAsMarkdown, exportAsHtml } = useFileOperations();

  const FileButton = ({ 
    onClick, 
    children, 
    title 
  }: { 
    onClick: () => void; 
    children: React.ReactNode; 
    title: string;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={title}
      className="h-8 w-8 p-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {children}
    </Button>
  );

  return (
    <div className="flex items-center justify-between gap-1 p-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      {/* Left side - File operations */}
      <div className="flex items-center gap-1">
        <FileButton
          onClick={importFromFile}
          title="Importar arquivo (MD, TXT, HTML)"
        >
          <Upload className="h-4 w-4" />
        </FileButton>
        
        <FileButton
          onClick={exportAsMarkdown}
          title="Exportar como Markdown"
        >
          <FileText className="h-4 w-4" />
        </FileButton>
        
        <FileButton
          onClick={exportAsHtml}
          title="Exportar como HTML"
        >
          <Download className="h-4 w-4" />
        </FileButton>
      </div>

      {/* Right side - Preview toggle (bigger button) */}
      {onTogglePreview && (
        <Button
          variant={isPreviewMode ? "default" : "outline"}
          size="default"
          onClick={onTogglePreview}
          title={isPreviewMode ? "Editar" : "Pré-visualização"}
          className="px-4 py-2 h-9 cursor-pointer transition-all duration-200 flex items-center gap-2"
        >
          {isPreviewMode ? (
            <>
              <Pencil className="h-4 w-4" />
              <span className="text-sm font-medium">Editar</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">Pré-visualização</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
}
