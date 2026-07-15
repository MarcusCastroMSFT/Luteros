'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/components/products/productCard';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/empty-state';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Search, Filter, Star, Users, Crown, SlidersHorizontal, X } from 'lucide-react';
import { Product, ProductCategory } from '@/types/product';

interface ActiveFilters {
  search: string;
  category: string;
  availability: string;
  featured: boolean;
}

interface ProductsPageClientProps {
  products: Product[];
  categories: ProductCategory[];
  totalPages: number;
  currentPage: number;
  activeFilters: ActiveFilters;
}

export function ProductsPageClient({
  products,
  categories,
  totalPages,
  currentPage,
  activeFilters,
}: ProductsPageClientProps) {
  const router = useRouter();
  // Local input state for the search box so typing isn't gated on round-trips
  const [searchInput, setSearchInput] = useState(activeFilters.search);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const buildUrl = (overrides: Partial<ActiveFilters & { page: number }>) => {
    const next = {
      page: 1,
      search: activeFilters.search,
      category: activeFilters.category,
      availability: activeFilters.availability,
      featured: activeFilters.featured,
      ...overrides,
    };
    const params = new URLSearchParams();
    if (next.page > 1) params.set('page', String(next.page));
    if (next.search) params.set('search', next.search);
    if (next.category) params.set('category', next.category);
    if (next.availability) params.set('availability', next.availability);
    if (next.featured) params.set('featured', 'true');
    const qs = params.toString();
    return qs ? `/products?${qs}` : '/products';
  };

  // Debounced search: commit to URL 300ms after the last keystroke
  useEffect(() => {
    if (searchInput === activeFilters.search) return;
    const timeoutId = setTimeout(() => {
      router.push(buildUrl({ search: searchInput, page: 1 }));
    }, 300);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const setCategory = (category: string) => router.push(buildUrl({ category, page: 1 }));
  const setAvailability = (availability: string) => router.push(buildUrl({ availability, page: 1 }));
  const toggleFeatured = () => router.push(buildUrl({ featured: !activeFilters.featured, page: 1 }));
  const setPage = (page: number) => {
    router.push(buildUrl({ page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const clearFilters = () => {
    setSearchInput('');
    router.push('/products');
  };

  const hasActiveFilters =
    activeFilters.search || activeFilters.category || activeFilters.availability || activeFilters.featured;
  const activeFilterCount = [
    activeFilters.search,
    activeFilters.category,
    activeFilters.availability,
    activeFilters.featured,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      {/* Mobile Filter Bar */}
      <div className="md:hidden mb-4">
        <div className="flex gap-2">
          {/* Search - Compact */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Buscar produtos..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 h-10 text-sm"
            />
          </div>

          {/* Filter Button with Badge */}
          <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 px-3 relative">
                <SlidersHorizontal size={18} />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
              <SheetHeader className="pb-4 border-b">
                <div className="flex items-center justify-between">
                  <SheetTitle>Filtros</SheetTitle>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={() => { clearFilters(); setIsMobileFiltersOpen(false); }}>
                      Limpar tudo
                    </Button>
                  )}
                </div>
              </SheetHeader>
              <div className="py-4 space-y-4 overflow-y-auto">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Categoria</label>
                  <select
                    value={activeFilters.category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 cursor-pointer"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map((category) => (
                      <option key={category.slug} value={category.name}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Availability Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Disponibilidade</label>
                  <select
                    value={activeFilters.availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 cursor-pointer"
                  >
                    <option value="">Todos</option>
                    <option value="all">Para Todos</option>
                    <option value="members">Só Membros</option>
                  </select>
                </div>

                {/* Featured Toggle */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Destaques</label>
                  <Button
                    variant={activeFilters.featured ? 'default' : 'outline'}
                    onClick={toggleFeatured}
                    className="w-full justify-center"
                  >
                    <Star size={16} className="mr-2" />
                    {activeFilters.featured ? 'Mostrando Destacados' : 'Ver Apenas Destacados'}
                  </Button>
                </div>

                {/* Apply Button */}
                <Button
                  className="w-full mt-4"
                  onClick={() => setIsMobileFiltersOpen(false)}
                >
                  Ver {products.length} produtos
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Quick Category Pills - Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mt-3 pb-1 -mx-4 px-4">
          <button
            onClick={() => setCategory('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
              !activeFilters.category
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          {categories.slice(0, 5).map((category) => (
            <button
              key={category.slug}
              onClick={() => setCategory(category.name)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                activeFilters.category === category.name
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Buscar produtos, marcas ou categorias..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="lg:w-48">
            <select
              value={activeFilters.category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 cursor-pointer focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.name}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div className="lg:w-40">
            <select
              value={activeFilters.availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 cursor-pointer focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="">Todos</option>
              <option value="all">Para Todos</option>
              <option value="members">Só Membros</option>
            </select>
          </div>

          {/* Featured Toggle */}
          <Button
            variant={activeFilters.featured ? 'default' : 'outline'}
            onClick={toggleFeatured}
            className="lg:w-32 cursor-pointer"
          >
            <Star size={16} className="mr-2" />
            Destacados
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="lg:w-24 cursor-pointer">
              <Filter size={16} className="mr-2" />
              Limpar
            </Button>
          )}
        </div>

        {/* Active Filters Display - Desktop only */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            {activeFilters.search && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Busca: &ldquo;{activeFilters.search}&rdquo;
                <button
                  onClick={() => { setSearchInput(''); router.push(buildUrl({ search: '', page: 1 })); }}
                  className="ml-1 hover:text-red-500 cursor-pointer"
                >
                  ×
                </button>
              </Badge>
            )}
            {activeFilters.category && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {activeFilters.category}
                <button
                  onClick={() => setCategory('')}
                  className="ml-1 hover:text-red-500 cursor-pointer"
                >
                  ×
                </button>
              </Badge>
            )}
            {activeFilters.availability && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {activeFilters.availability === 'all' ? (
                  <>
                    <Users size={12} />
                    Para Todos
                  </>
                ) : (
                  <>
                    <Crown size={12} />
                    Só Membros
                  </>
                )}
                <button
                  onClick={() => setAvailability('')}
                  className="ml-1 hover:text-red-500 cursor-pointer"
                >
                  ×
                </button>
              </Badge>
            )}
            {activeFilters.featured && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star size={12} />
                Destacados
                <button
                  onClick={toggleFeatured}
                  className="ml-1 hover:text-red-500 cursor-pointer"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <>
          {/* Products Count - Mobile optimized */}
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <div className="text-xs md:text-sm text-gray-600">
              <span className="font-medium text-gray-900">{products.length}</span> produto{products.length !== 1 ? 's' : ''}
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="md:hidden flex items-center gap-1 text-xs text-brand-600 font-medium"
              >
                <X size={14} />
                Limpar filtros
              </button>
            )}
          </div>

          {/* Products Grid - 2 columns on mobile */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-8">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 3} />
            ))}
          </div>

          {/* Pagination - Mobile optimized */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 md:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="cursor-pointer text-xs md:text-sm px-2 md:px-4"
              >
                <span className="hidden sm:inline">Anterior</span>
                <span className="sm:hidden">←</span>
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(page)}
                      className="w-8 md:w-10 text-xs md:text-sm cursor-pointer"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="cursor-pointer text-xs md:text-sm px-2 md:px-4"
              >
                <span className="hidden sm:inline">Próxima</span>
                <span className="sm:hidden">→</span>
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          variant={hasActiveFilters ? 'search' : 'products'}
          title="Nenhum produto encontrado"
          description={
            hasActiveFilters
              ? 'Tente ajustar os filtros ou fazer uma busca diferente.'
              : 'Ainda não há produtos ou ofertas disponíveis. Volte em breve para conferir as novidades!'
          }
          action={hasActiveFilters ? { label: 'Limpar todos os filtros', onClick: clearFilters } : undefined}
        />
      )}
    </div>
  );
}
