'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { HelpContentRenderer } from '@/components/help/help-content-renderer';
import type { HelpArticle } from '@/types/help';

interface HelpPageData {
  article: HelpArticle;
  relatedArticles: HelpArticle[];
  success: boolean;
}

export default function HelpArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const [data, setData] = useState<HelpPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Unwrap the params promise
  const { slug } = use(params);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/help/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Artigo não encontrado');
          }
          throw new Error('Erro ao carregar artigo');
        }
        
        const articleData = await response.json();
        if (articleData.success) {
          setData(articleData);
        } else {
          throw new Error(articleData.error || 'Erro ao carregar artigo');
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar artigo');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {error}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              O artigo que você está procurando não foi encontrado ou não pôde ser carregado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/help" 
                className="bg-cta-highlight hover:bg-cta-highlight/90 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Voltar ao Centro de Ajuda
              </Link>
              <button 
                onClick={() => window.location.reload()} 
                className="border border-cta-highlight text-cta-highlight hover:bg-cta-highlight/10 px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { article, relatedArticles } = data;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="mb-8">
            <Link 
              href="/help" 
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-cta-highlight transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} className="mr-2" />
              Voltar ao Centro de Ajuda
            </Link>
          </div>

          {/* Article Header */}
          <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <Badge className="bg-cta-highlight/10 text-cta-highlight border-cta-highlight/20">
                {article.category}
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
              {article.title}
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {article.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Clock size={16} className="mr-2" />
                {article.readTime}
              </div>
              <div className="flex items-center">
                <Calendar size={16} className="mr-2" />
                Atualizado em {article.lastUpdated}
              </div>
              <Badge 
                variant={article.difficulty === 'easy' ? 'secondary' : article.difficulty === 'medium' ? 'outline' : 'default'}
                className="text-xs"
              >
                {article.difficulty === 'easy' ? 'Fácil' : article.difficulty === 'medium' ? 'Médio' : 'Avançado'}
              </Badge>
            </div>
          </div>

          {/* Article Content */}
          <div className="mb-12">
            <HelpContentRenderer slug={article.slug} />
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">
                Artigos relacionados
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <Link
                    key={relatedArticle.slug}
                    href={`/help/${relatedArticle.slug}`}
                    className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-cta-highlight/20 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-cta-highlight transition-colors">
                        {relatedArticle.title}
                      </h3>
                      <ArrowRight className="text-gray-400 dark:text-gray-500 group-hover:text-cta-highlight transition-colors flex-shrink-0 ml-2" size={16} />
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {relatedArticle.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{relatedArticle.readTime}</span>
                      <Badge 
                        variant={relatedArticle.difficulty === 'easy' ? 'secondary' : relatedArticle.difficulty === 'medium' ? 'outline' : 'default'}
                        className="text-xs"
                      >
                        {relatedArticle.difficulty === 'easy' ? 'Fácil' : relatedArticle.difficulty === 'medium' ? 'Médio' : 'Avançado'}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Help CTA */}
          <div className="mt-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Este artigo foi útil?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Se você ainda tem dúvidas, nossa equipe está aqui para ajudar
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact" 
                className="bg-cta-highlight hover:bg-cta-highlight/90 text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Contatar Suporte
              </Link>
              <Link 
                href="/help" 
                className="border border-cta-highlight text-cta-highlight hover:bg-cta-highlight/10 px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Ver Mais Artigos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
