'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProductCard } from '@/components/products/productCard';
import { ProductListSkeleton } from '@/components/products/productListSkeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Filter, Star, Users, Crown } from 'lucide-react';
import { Product, ProductsApiResponse, ProductCategory } from '@/types/product';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    availability: '',
    featured: false,
  });

  const fetchProducts = useCallback(async () => {
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

      const response = await fetch(`/api/products?${queryParams}`);
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
  }, [currentPage, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', availability: '', featured: false });
    setCurrentPage(1);
  };

  const hasActiveFilters = filters.search || filters.category || filters.availability || filters.featured;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Erro ao carregar produtos
          </div>
          <div className="text-gray-600 dark:text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Produtos e Descontos Exclusivos
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Descontos especiais em produtos e serviços selecionados para mães, pais e famílias. 
              Membros têm acesso a ofertas exclusivas!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Buscar produtos, marcas ou categorias..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 cursor-pointer"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Todas as categorias</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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

          {/* Active Filters Display */}
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
            {/* Products Count */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {products.length} produto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="cursor-pointer"
                >
                  Anterior
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      className="w-10 cursor-pointer"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="cursor-pointer"
                >
                  Próxima
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
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
    </div>
  );
}
