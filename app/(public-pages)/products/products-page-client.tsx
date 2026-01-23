'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProductCard } from '@/components/products/productCard';
import { ProductListSkeleton } from '@/components/products/productListSkeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Search, Filter, Star, Users, Crown, SlidersHorizontal, X } from 'lucide-react';
import { Product, ProductsApiResponse, ProductCategory } from '@/types/product';

interface ProductsPageClientProps {
  initialProducts: Product[];
  initialCategories: ProductCategory[];
  initialTotalPages: number;
}

export function ProductsPageClient({ 
  initialProducts, 
  initialCategories, 
  initialTotalPages 
}: ProductsPageClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<ProductCategory[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    availability: '',
    featured: false,
  });
  const [isFiltering, setIsFiltering] = useState(false);

  const fetchProducts = useCallback(async () => {
    // Skip fetch if using initial data (no filters, page 1)
    if (!isFiltering && currentPage === 1 && !filters.search && !filters.category && !filters.availability && !filters.featured) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.availability && { availability: filters.availability }),
        ...(filters.featured && { featured: 'true' }),
      });

      const response = await fetch(`/api/products-public?${queryParams}`);
      const result: ProductsApiResponse = await response.json();

      if (result.success) {
        setProducts(result.data);
        setCategories(result.categories);
        setTotalPages(result.pagination.totalPages);
      } else {
        setError('Erro ao carregar produtos');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Erro ao carregar produtos');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters, isFiltering]);

  useEffect(() => {
    if (isFiltering || currentPage > 1) {
      fetchProducts();
    }
  }, [fetchProducts, isFiltering, currentPage]);

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    setIsFiltering(true);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', availability: '', featured: false });
    setCurrentPage(1);
    setIsFiltering(false);
    // Reset to initial data
    setProducts(initialProducts);
    setCategories(initialCategories);
    setTotalPages(initialTotalPages);
  };

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const hasActiveFilters = filters.search || filters.category || filters.availability || filters.featured;
  const activeFilterCount = [filters.search, filters.category, filters.availability, filters.featured].filter(Boolean).length;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-900 mb-2">
            Erro ao carregar produtos
          </div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

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
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
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
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
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
                    value={filters.availability}
                    onChange={(e) => handleFilterChange('availability', e.target.value)}
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
                    variant={filters.featured ? "default" : "outline"}
                    onClick={() => handleFilterChange('featured', !filters.featured)}
                    className="w-full justify-center"
                  >
                    <Star size={16} className="mr-2" />
                    {filters.featured ? 'Mostrando Destacados' : 'Ver Apenas Destacados'}
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
            onClick={() => handleFilterChange('category', '')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
              !filters.category
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          {categories.slice(0, 5).map((category) => (
            <button
              key={category.slug}
              onClick={() => handleFilterChange('category', category.name)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                filters.category === category.name
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
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
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
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 cursor-pointer focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                <option value="">Todos</option>
                <option value="all">Para Todos</option>
                <option value="members">Só Membros</option>
              </select>
            </div>

            {/* Featured Toggle */}
            <Button
              variant={filters.featured ? "default" : "outline"}
              onClick={() => handleFilterChange('featured', !filters.featured)}
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
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Busca: &ldquo;{filters.search}&rdquo;
                  <button
                    onClick={() => handleFilterChange('search', '')}
                    className="ml-1 hover:text-red-500 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.category && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.category}
                  <button
                    onClick={() => handleFilterChange('category', '')}
                    className="ml-1 hover:text-red-500 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.availability && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.availability === 'all' ? (
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
                    onClick={() => handleFilterChange('availability', '')}
                    className="ml-1 hover:text-red-500 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.featured && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star size={12} />
                  Destacados
                  <button
                    onClick={() => handleFilterChange('featured', false)}
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
        {isLoading ? (
          <ProductListSkeleton />
        ) : products.length > 0 ? (
          <>
            {/* Products Count - Mobile optimized */}
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <div className="text-xs md:text-sm text-gray-600">
                <span className="font-medium text-gray-900">{products.length}</span> produto{products.length !== 1 ? 's' : ''}
              </div>
              {/* Mobile Active Filters Indicator */}
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
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination - Mobile optimized */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1 md:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentPage(prev => Math.max(prev - 1, 1));
                    setIsFiltering(true);
                  }}
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
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setCurrentPage(page);
                          setIsFiltering(true);
                        }}
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
                  onClick={() => {
                    setCurrentPage(prev => Math.min(prev + 1, totalPages));
                    setIsFiltering(true);
                  }}
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
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Filter size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
              <p>Tente ajustar os filtros ou fazer uma busca diferente.</p>
            </div>
            {hasActiveFilters && (
              <Button onClick={clearFilters} className="mt-4 cursor-pointer">
                Limpar todos os filtros
              </Button>
            )}
          </div>
        )}
    </div>
  );
}
