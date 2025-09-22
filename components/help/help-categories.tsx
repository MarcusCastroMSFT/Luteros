import React from 'react';
import Link from 'next/link';
import { Book, Users, Search, CheckCircle, ChevronRight, Clock } from 'lucide-react';
import type { HelpCategory } from '@/types/help';

interface HelpCategoriesProps {
  categories: HelpCategory[];
}

// Icon mapping function to convert string names to components
const getIconComponent = (iconName: string) => {
  const icons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    Book,
    Users,
    Search,
    CheckCircle
  };
  return icons[iconName] || Book;
};

export function HelpCategories({ categories }: HelpCategoriesProps) {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Categorias de Ajuda
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {categories.map(category => {
          const Icon = getIconComponent(category.icon);
          return (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm"
            >
              <div className="flex items-center mb-4">
                <div className="bg-cta-highlight/10 dark:bg-cta-highlight/20 p-3 rounded-lg mr-4">
                  <Icon className="text-cta-highlight dark:text-cta-highlight" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {category.description}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                {category.articles.map(article => (
                  <Link
                    key={article.id}
                    href={article.href}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-cta-highlight dark:group-hover:text-cta-highlight transition-colors">
                          {article.title}
                        </h4>
                        {article.isPopular && (
                          <span className="ml-2 bg-cta-highlight text-white text-xs px-2 py-1 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {article.description}
                      </p>
                    </div>
                    <div className="flex items-center ml-4 text-xs text-gray-500 dark:text-gray-500">
                      <Clock size={12} className="mr-1" />
                      {article.readTime}
                      <ChevronRight className="ml-2 text-gray-400 group-hover:text-cta-highlight transition-colors" size={14} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
