'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { SpecialistFilterSkeleton } from './specialistSkeleton';

interface SpecialistFilterProps {
  specialties: string[];
  activeSpecialty: string;
  searchTerm: string;
  loading?: boolean;
  onSpecialtyChange: (specialty: string) => void;
  onSearchChange: (search: string) => void;
  onSearchSubmit: () => void;
}

export function SpecialistFilter({
  specialties,
  activeSpecialty,
  searchTerm,
  loading = false,
  onSpecialtyChange,
  onSearchChange,
  onSearchSubmit,
}: SpecialistFilterProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  if (loading) {
    return <SpecialistFilterSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar especialistas..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 cursor-text"
          />
        </div>
        <Button 
          onClick={onSearchSubmit}
          className="cursor-pointer"
          aria-label="Buscar"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Specialty Filters */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
          Especialidades
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeSpecialty === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSpecialtyChange('all')}
            className="cursor-pointer text-sm"
          >
            Todos
          </Button>
          {specialties.map((specialty) => (
            <Button
              key={specialty}
              variant={activeSpecialty === specialty ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSpecialtyChange(specialty)}
              className="cursor-pointer text-sm"
            >
              {specialty}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
