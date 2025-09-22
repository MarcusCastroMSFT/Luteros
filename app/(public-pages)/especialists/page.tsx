'use client';

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { sampleSpecialists } from '@/data/specialists';
import { SpecialistList } from '@/components/specialists/specialistList';
import { Pagination } from '@/components/common/pagination';
import { PageHeader } from '@/components/common/pageHeader';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SPECIALISTS_PER_PAGE = 10;

const categories = [
  'Todos',
  'Psicólogo',
  'Médico',
  'Educador Sexual',
  'Sexólogo',
  'Enfermeira',
  'Ginecologista',
  'Obstetra'
];

const sortOptions = [
  { value: 'default', label: 'Padrão' },
  { value: 'name', label: 'Nome A-Z' },
  { value: 'rating', label: 'Melhor Avaliação' },
  { value: 'students', label: 'Mais Estudantes' },
  { value: 'courses', label: 'Mais Cursos' }
];

export default function SpecialistsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSortedSpecialists = useMemo(() => {
    const filtered = sampleSpecialists.filter(specialist => {
      const matchesSearch = specialist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          specialist.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          specialist.specialties.some(specialty => 
                            specialty.toLowerCase().includes(searchTerm.toLowerCase())
                          );
      
      const matchesCategory = selectedCategory === 'Todos' || 
                            specialist.profession.toLowerCase().includes(selectedCategory.toLowerCase());
      
      return matchesSearch && matchesCategory;
    });

    // Sort specialists
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'students':
        filtered.sort((a, b) => b.studentsCount - a.studentsCount);
        break;
      case 'courses':
        filtered.sort((a, b) => b.coursesCount - a.coursesCount);
        break;
      default:
        // Keep default order
        break;
    }

    return filtered;
  }, [searchTerm, selectedCategory, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedSpecialists.length / SPECIALISTS_PER_PAGE);
  const paginatedSpecialists = filteredAndSortedSpecialists.slice(
    (currentPage - 1) * SPECIALISTS_PER_PAGE,
    currentPage * SPECIALISTS_PER_PAGE
  );

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header */}
      <PageHeader
        title="Especialistas"
        description="Profissionais qualificados que ajudam você a ter uma vida sexual mais saudável e plena."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Especialistas' }
        ]}
      />

      {/* Filters Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar por especialista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-4 items-center">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            {filteredAndSortedSpecialists.length === 0 
              ? 'Nenhum especialista encontrado'
              : `${filteredAndSortedSpecialists.length} especialista${filteredAndSortedSpecialists.length !== 1 ? 's' : ''} encontrado${filteredAndSortedSpecialists.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>

        {/* Specialists Grid */}
        {filteredAndSortedSpecialists.length > 0 ? (
          <>
            <SpecialistList specialists={paginatedSpecialists} />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhum especialista encontrado com os filtros selecionados.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Todos');
                setSortBy('default');
              }}
              className="text-[var(--cta-highlight)] hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
