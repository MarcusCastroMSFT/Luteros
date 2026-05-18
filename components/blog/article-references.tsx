'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface ArticleReferencesProps {
  /** Pre-rendered HTML for the references section. */
  html: string;
  /** Whether the section is open by default. */
  defaultOpen?: boolean;
  className?: string;
}

/**
 * Collapsible "Referências" section rendered after the article body.
 * Hidden entirely when there's no content (empty string or whitespace-only).
 */
export function ArticleReferences({ html, defaultOpen = false, className }: ArticleReferencesProps) {
  const [open, setOpen] = useState(defaultOpen);

  // Strip tags to test for non-empty content so we don't render an empty section
  // when the admin saved a blank rich-text value.
  const isEmpty = !html || html.replace(/<[^>]*>/g, '').trim() === '';
  if (isEmpty) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={cn('rounded-xl border border-gray-200 bg-gray-50/40', className)}>
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 p-5 text-left cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="h-4 w-4" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 font-cardo">Referências</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {open ? 'Toque para recolher' : 'Toque para ver as fontes citadas'}
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-gray-500 transition-transform duration-200',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="border-t border-gray-200 px-5 py-5">
          <div
            className="prose prose-sm max-w-none prose-headings:font-cardo prose-a:text-primary prose-a:underline prose-a:break-words prose-li:my-1 prose-p:my-2"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
