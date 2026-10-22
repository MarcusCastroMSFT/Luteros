import React from 'react';
import Image from 'next/image';
import { BrandIcon, type BrandIconName } from '@/components/brand/brand-icon';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { DisplayHeading } from '@/components/common/display-heading';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs: BreadcrumbItem[];
  className?: string;
  align?: 'left' | 'center';
  illustration?: BrandIconName;
}

export function PageHeader({ title, description, breadcrumbs, className = '', align = 'center', illustration }: PageHeaderProps) {
  const isLeft = align === 'left' || Boolean(illustration);
  
  return (
    <section className={cn(illustration ? 'relative isolate overflow-hidden bg-background py-8 md:py-10 lg:py-14' : 'py-8 md:py-12 lg:py-16 bg-cta-background', className)}>
      {illustration && (
        <>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[url('/images/brand/paper-grain.svg')]" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-48 -top-64 hidden size-[640px] rounded-[42%_58%_38%_62%] bg-[#e4eeeb] md:block" />
        </>
      )}
      <div className={illustration ? 'relative mx-auto grid max-w-[1480px] items-center gap-12 px-6 sm:px-10 md:grid-cols-[1.7fr_1fr] lg:px-12' : 'container mx-auto px-4 max-w-[1428px]'}>
        <div className={`${isLeft ? 'text-left' : 'text-center max-w-4xl mx-auto'}`}>
          {/* Breadcrumb */}
          <Breadcrumb className={`${isLeft ? 'justify-start' : 'justify-center'} mb-3 md:mb-6`}>
            <BreadcrumbList className={isLeft ? 'justify-start' : 'justify-center'}>
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {item.href ? (
                      <BreadcrumbLink href={item.href} className="text-sm md:text-base text-gray-600 hover:text-primary">
                        {item.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="text-sm md:text-base text-gray-900 font-medium">
                        {item.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

          {/* Title */}
          <DisplayHeading size="md" className={cn('mb-3 md:mb-6', illustration ? 'text-5xl font-normal tracking-[-0.03em] text-brand-900 md:text-6xl lg:text-7xl' : 'text-3xl md:text-4xl lg:text-5xl', isLeft && 'max-w-3xl')}>
            {title}
          </DisplayHeading>

          {/* Description */}
          {description && (
            <p className={cn(illustration ? 'max-w-2xl text-base leading-[1.8] text-slate-600 sm:text-lg' : `text-base md:text-lg text-gray-600 ${isLeft ? 'max-w-3xl' : 'max-w-2xl mx-auto'}`)}>
              {description}
            </p>
          )}
        </div>
        {illustration && (
          <div aria-hidden="true" className="relative mx-auto hidden w-52 items-center justify-center md:flex lg:w-60">
            <BrandIcon kind={illustration} className="size-44 lg:size-52" />
            <Image src={`/images/brand/${illustration === 'articles' || illustration === 'help' ? 'care-flow' : illustration === 'courses' || illustration === 'contact' ? 'care-petals' : 'care-bloom'}.svg`} alt="" width={180} height={180} unoptimized className="pointer-events-none absolute -bottom-4 -left-6 h-auto w-20 rotate-[-15deg] opacity-70" />
          </div>
        )}
      </div>
    </section>
  );
}
