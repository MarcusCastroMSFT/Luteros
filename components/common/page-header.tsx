import React from 'react';
import Image from 'next/image';
import { PreTitleTag } from '@/components/common/pre-title-tag';

interface PageHeaderProps {
  preTitle?: string;
  title: string;
  description?: string;
  imageSrc?: string;
}

export function PageHeader({ preTitle, title, description, imageSrc }: PageHeaderProps) {
  return (
    <div className="relative bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/20 dark:to-brand-800/20 py-16 lg:py-24">
      {imageSrc && (
        <div className="absolute inset-0 opacity-10">
          <Image
            src={imageSrc}
            alt=""
            fill
            className="object-cover"
          />
        </div>
      )}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {preTitle && <PreTitleTag text={preTitle} />}
          
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
            {title}
          </h1>
          
          {description && (
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
