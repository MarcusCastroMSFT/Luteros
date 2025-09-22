import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function CategoryFilterSkeleton() {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-12">
      {/* Simulate 6-7 category buttons with different widths */}
      <Skeleton className="h-10 w-16" /> {/* "Todos" */}
      <Skeleton className="h-10 w-28" /> {/* "Educação Sexual" */}
      <Skeleton className="h-10 w-24" /> {/* "Maternidade" */}
      <Skeleton className="h-10 w-32" /> {/* "Relacionamentos" */}
      <Skeleton className="h-10 w-28" /> {/* "Saúde da Mulher" */}
      <Skeleton className="h-10 w-26" /> {/* "Terapia Sexual" */}
      <Skeleton className="h-10 w-30" /> {/* "Saúde Masculina" */}
    </div>
  );
}
