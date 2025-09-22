'use client';

import React from 'react';
import { Facebook, Linkedin, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Custom X (Twitter) Logo Component
const XLogo = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

interface ArticleShareProps {
  title: string;
  url: string;
  className?: string;
}

export function ArticleShare({ title, url, className = '' }: ArticleShareProps) {
  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'hover:bg-[var(--cta-highlight)]'
    },
    {
      name: 'X.com',
      icon: XLogo,
      url: `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      color: 'hover:bg-[var(--cta-highlight)]'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: 'hover:bg-[var(--cta-highlight)]'
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Pronto! Link copiado.', {
        duration: 3000,
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error('Falha ao copiar link', {
        duration: 3000,
      });
    }
  };

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-semibold mb-4 font-cardo text-gray-900 dark:text-white">Compartilhar Artigo</h3>
      <div className="flex flex-wrap gap-3">
        {shareLinks.map((link) => (
          <Button
            key={link.name}
            variant="outline"
            size="sm"
            asChild
            className={`flex items-center gap-2 cursor-pointer transition-colors ${link.color} hover:text-white`}
          >
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              <link.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{link.name}</span>
            </a>
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="flex items-center gap-2 cursor-pointer hover:bg-[var(--cta-highlight)] hover:text-white"
        >
          <LinkIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Copiar Link</span>
        </Button>
      </div>
    </div>
  );
}
