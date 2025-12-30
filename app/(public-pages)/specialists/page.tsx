'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/pageHeader';
import { SpecialistFilter } from '@/components/specialists/specialistFilter';
import { SpecialistCard } from '@/components/specialists/specialistCard';
import { SpecialistListSkeleton } from '@/components/specialists/specialistSkeleton';
import { Pagination } from '@/components/common/pagination';
import { type Specialist, type SpecialistApiResponse, type SpecialistPagination } from '@/types/specialist';

const SPECIALISTS_PER_PAGE = 12;

export default function SpecialistsPage() {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [pagination, setPagination] = useState<SpecialistPagination | null>(null);
  const [activeSpecialty, setActiveSpecialty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpecialists = async (page: number = 1, specialty: string = 'all', search: string = '') => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: SPECIALISTS_PER_PAGE.toString(),
      });

      if (specialty && specialty !== 'all') {
        params.append('specialty', specialty);
      }

      if (search.trim()) {
        params.append('search', search.trim());
      }

      const response = await fetch(`/api/specialists?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SpecialistApiResponse = await response.json();
      
      setSpecialists(data.specialists);
      setPagination(data.pagination);
      setSpecialties(data.specialties);
    } catch (err) {
      console.error('Error fetching specialists:', err);
      setError('Falha ao carregar especialistas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialists(currentPage, activeSpecialty, searchTerm);
  }, [currentPage, activeSpecialty, searchTerm]);

  const handleSpecialtyChange = (specialty: string) => {
    setActiveSpecialty(specialty);
    setCurrentPage(1);
  };

  const handleSearchSubmit = () => {
    setCurrentPage(1);
    fetchSpecialists(1, activeSpecialty, searchTerm);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Page Header */}
      <PageHeader
        title="Nossos Especialistas"
        description="Conheça nossos profissionais qualificados em saúde sexual e educação"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Especialistas', href: '/specialists' },
        ]}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-1/4">
            <div className="sticky top-4">
              <SpecialistFilter
                specialties={specialties}
                activeSpecialty={activeSpecialty}
                searchTerm={searchTerm}
                loading={loading}
                onSpecialtyChange={handleSpecialtyChange}
                onSearchChange={handleSearchChange}
                onSearchSubmit={handleSearchSubmit}
              />
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:w-3/4">
            {/* Results Header */}
            {!loading && pagination && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <p className="text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
                  {pagination.totalItems === 0 ? (
                    'Nenhum especialista encontrado'
                  ) : (
                    <>
                      Mostrando {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-
                      {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} de{' '}
                      {pagination.totalItems} especialista{pagination.totalItems !== 1 ? 's' : ''}
                    </>
                  )}
                </p>
                
                {activeSpecialty !== 'all' && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Filtro ativo:</span>
                    <span className="px-2 py-1 text-xs bg-cta-highlight/10 text-cta-highlight rounded-full">
                      {activeSpecialty}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                  <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                  <button 
                    onClick={() => fetchSpecialists(currentPage, activeSpecialty, searchTerm)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    Tentar Novamente
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && <SpecialistListSkeleton />}

            {/* Specialists Grid */}
            {!loading && !error && specialists.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {specialists.map((specialist) => (
                  <SpecialistCard key={specialist.id} specialist={specialist} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && specialists.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Nenhum especialista encontrado
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Tente ajustar seus filtros ou termos de busca.
                  </p>
                  <button 
                    onClick={() => {
                      setActiveSpecialty('all');
                      setSearchTerm('');
                      setCurrentPage(1);
                      fetchSpecialists(1, 'all', '');
                    }}
                    className="px-4 py-2 bg-cta-highlight text-white rounded-md hover:bg-cta-highlight/90 transition-colors cursor-pointer"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            )}

            {/* Pagination */}
            {!loading && pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}