import React from 'react';
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
}

export function PageHeader({ title, description, breadcrumbs, className = '', align = 'center' }: PageHeaderProps) {
  const isLeft = align === 'left';
  
  return (
    <section className={`py-16 lg:py-16 bg-cta-background ${className}`}>
      <div className="container mx-auto px-4 max-w-[1428px]">
        <div className={`${isLeft ? 'text-left' : 'text-center max-w-4xl mx-auto'}`}>
          {/* Breadcrumb */}
          <Breadcrumb className={`${isLeft ? 'justify-start' : 'justify-center'} mb-6`}>
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {item.href ? (
                      <BreadcrumbLink href={item.href} className="text-gray-600 hover:text-primary">
                        {item.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="text-gray-900 font-medium">
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
          <DisplayHeading size="md" className={`font-cardo mb-6 ${isLeft ? 'max-w-3xl' : ''}`}>
            {title}
          </DisplayHeading>

          {/* Description */}
          {description && (
            <p className={`text-lg text-gray-600 ${isLeft ? 'max-w-3xl' : 'max-w-2xl mx-auto'}`}>
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
