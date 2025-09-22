import React from 'react';
import { Specialist } from '@/types/specialist';
import { SpecialistCard } from './specialistCard';

interface SpecialistListProps {
  specialists: Specialist[];
  limit?: number;
  showPagination?: boolean;
  className?: string;
}

export function SpecialistList({ 
  specialists, 
  limit,
  showPagination = false,
  className = ''
}: SpecialistListProps) {
  const displayedSpecialists = limit ? specialists.slice(0, limit) : specialists;

  return (
    <div className={className}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {displayedSpecialists.map((specialist) => (
          <SpecialistCard 
            key={specialist.id} 
            specialist={specialist}
          />
        ))}
      </div>
      
      {showPagination && specialists.length > (limit || specialists.length) && (
        <div className="mt-8 flex justify-center">
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            Mostrando {displayedSpecialists.length} de {specialists.length} especialistas
          </div>
        </div>
      )}
    </div>
  );
}
