'use client';

import { PageHeader } from '@/components/common/pageHeader';
import { Search, ChevronRight, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { QuickActions, PopularArticles, HelpCategories, ContactSection } from '@/components/help';
import type { HelpPageData } from '@/types/help';

export default function HelpPage() {
  const [data, setData] = useState<HelpPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHelpData = async () => {
      try {
        const response = await fetch('/api/help');
        if (!response.ok) {
          throw new Error('Erro ao carregar dados da ajuda');
        }
        
        const helpData = await response.json();
        if (helpData.success) {
          setData(helpData);
        } else {
          throw new Error(helpData.error || 'Erro ao carregar dados da ajuda');
        }
      } catch (err) {
        console.error('Error fetching help data:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados da ajuda');
      } finally {
        setLoading(false);
      }
    };

    fetchHelpData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Central de Ajuda"
          description="Encontre respostas para suas dúvidas e aprenda a usar a lutteros"
          breadcrumbs={[
            { label: 'Início', href: '/' },
            { label: 'Central de Ajuda' }
          ]}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-full mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Central de Ajuda"
          description="Encontre respostas para suas dúvidas e aprenda a usar a lutteros"
          breadcrumbs={[
            { label: 'Início', href: '/' },
            { label: 'Central de Ajuda' }
          ]}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const filteredCategories = data.categories.filter(category => {
    if (!searchTerm) return true;
    return category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           category.articles.some(article => 
             article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             article.description.toLowerCase().includes(searchTerm.toLowerCase())
           );
  });

  const allArticles = data.categories.flatMap(category => 
    category.articles.map(article => ({ ...article, category: category.title }))
  );

  const filteredArticles = searchTerm ? 
    allArticles.filter(article => 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Central de Ajuda"
        description="Encontre respostas, guias e suporte para usar a lutteros"
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Ajuda' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar artigos de ajuda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-cta-highlight focus:border-transparent shadow-sm text-lg"
            />
          </div>
          
          {searchTerm && (
            <div className="mt-4 text-sm text-gray-600">
              {filteredArticles.length} resultado{filteredArticles.length !== 1 ? 's' : ''} encontrado{filteredArticles.length !== 1 ? 's' : ''} para &ldquo;{searchTerm}&rdquo;
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <QuickActions actions={data.quickActions} />

        {/* Search Results */}
        {searchTerm && filteredArticles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Resultados da Busca
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles.map(article => (
                <Link
                  key={article.id}
                  href={article.href}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:border-cta-highlight hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 group-hover:text-cta-highlight transition-colors">
                      {article.title}
                    </h3>
                    <ChevronRight className="text-gray-400 group-hover:text-cta-highlight transition-colors flex-shrink-0 ml-2" size={16} />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {article.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {article.category}
                    </span>
                    <span className="flex items-center">
                      <Clock size={12} className="mr-1" />
                      {article.readTime}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        {!searchTerm && (
          <>
            {/* Popular Articles */}
            <PopularArticles articles={data.popularArticles} />

            {/* Categories */}
            <HelpCategories categories={filteredCategories} />
          </>
        )}

        {/* Contact Section */}
        <ContactSection />
      </div>
    </div>
  );
}
