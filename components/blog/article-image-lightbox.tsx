'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ZoomIn } from 'lucide-react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';

interface ArticleImageLightboxProps {
  src: string;
  alt: string;
}

export function ArticleImageLightbox({ src, alt }: ArticleImageLightboxProps) {
  const [open, setOpen] = useState(false);
  const isDataUrl = src.startsWith('data:');

  return (
    <>
      <button
        type="button"
        className="w-full rounded-lg overflow-hidden bg-gray-200 block cursor-zoom-in relative group"
        onClick={() => setOpen(true)}
        aria-label="Ampliar imagem"
      >
        {isDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="w-full h-auto block" loading="eager" />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={0}
            height={0}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            className="w-full h-auto block"
            priority
            quality={85}
          />
        )}
        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
          <span className="bg-black/50 text-white rounded-full p-2">
            <ZoomIn className="w-5 h-5" />
          </span>
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        {/* Use a scrollable overlay so very tall images don't overflow */}
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto p-0 bg-transparent border-none shadow-none overflow-auto flex items-center justify-center">
          <DialogClose className="fixed right-4 top-4 z-50 rounded-full bg-black/60 text-white p-1.5 hover:bg-black/80 transition-colors">
            <X className="w-5 h-5" />
            <span className="sr-only">Fechar</span>
          </DialogClose>
          {/* Always use a plain <img> in the lightbox — the blob URL is already on
              a CDN so no Next.js optimization is needed, and <Image width={0}/> 
              sets inline style="width:0px" which collapses the dialog. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="block max-w-[90vw] max-h-[90vh] w-auto h-auto rounded-lg"
            style={{ objectFit: 'contain' }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
