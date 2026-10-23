'use client';

import { useState, type MouseEvent, type ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface ZoomedImage {
  src: string;
  alt: string;
  caption: string;
}

/**
 * Opens images inside article HTML in a full-screen viewer. The HTML comes from the editor,
 * so the zoom buttons are rendered by `formatArticleHtml` and handled here by delegation.
 */
export function ArticleImageZoom({ className, children }: { className?: string; children: ReactNode }) {
  const [image, setImage] = useState<ZoomedImage | null>(null);

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const trigger = (event.target as HTMLElement).closest<HTMLElement>('[data-zoom]');
    const img = trigger?.querySelector('img');
    if (!trigger || !img || !event.currentTarget.contains(trigger)) return;
    const caption = trigger.closest('figure')?.querySelector('figcaption')?.textContent?.trim() ?? '';
    setImage({ src: img.currentSrc || img.src, alt: img.alt, caption });
  };

  return (
    // Click delegation only: every zoomable image is already a native <button>.
    <div className={className} onClick={handleClick}>
      {children}
      <DialogPrimitive.Root open={image !== null} onOpenChange={(open) => !open && setImage(null)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#031a1c]/90 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-4 outline-none sm:p-8 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
            onClick={(event) => {
              if (event.target === event.currentTarget) setImage(null);
            }}
          >
            <DialogPrimitive.Title className="sr-only">{image?.caption || image?.alt || 'Imagem do artigo'}</DialogPrimitive.Title>
            {image && (
              // Plain <img>: the original file is shown at full resolution, no resizing needed.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image.src}
                alt={image.alt}
                className="max-h-[calc(100dvh-9rem)] w-auto max-w-full rounded-xl bg-[#faf9f6] object-contain shadow-2xl"
              />
            )}
            {image?.caption && (
              <p className="max-w-3xl text-center text-sm leading-relaxed text-white/85 sm:text-base">{image.caption}</p>
            )}
            <DialogPrimitive.Close className="absolute right-4 top-4 grid size-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7fd3d8]">
              <X className="size-5" aria-hidden="true" />
              <span className="sr-only">Fechar imagem</span>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
