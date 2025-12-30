'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, X, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  image?: string;
}

interface RelatedArticlesSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  currentArticleId?: string;
  disabled?: boolean;
  maxSelection?: number;
}

export function RelatedArticlesSelector({
  selectedIds,
  onChange,
  currentArticleId,
  disabled = false,
  maxSelection = 3,
}: RelatedArticlesSelectorProps) {
  const [open, setOpen] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Fetch published articles
        const response = await fetch('/api/articles?pageSize=100&sortBy=title&sortOrder=asc');
        if (!response.ok) throw new Error('Failed to fetch articles');
        
        const data = await response.json();
        
        // Filter out current article and only show published articles
        const availableArticles = (data.data || [])
          .filter((article: Article & { status?: string }) => 
            article.id !== currentArticleId && article.status === 'Ativo'
          )
          .map((article: Article) => ({
            id: article.id,
            title: article.title,
            slug: article.slug,
            category: article.category,
            image: article.image,
          }));
        
        setArticles(availableArticles);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [currentArticleId]);

  const selectedArticles = articles.filter(article => selectedIds.includes(article.id));
  const canAddMore = selectedIds.length < maxSelection;

  const handleSelect = (articleId: string) => {
    if (selectedIds.includes(articleId)) {
      onChange(selectedIds.filter(id => id !== articleId));
    } else if (canAddMore) {
      onChange([...selectedIds, articleId]);
    }
  };

  const handleRemove = (articleId: string) => {
    onChange(selectedIds.filter(id => id !== articleId));
  };

  return (
    <div className="space-y-2">
      <Label>Artigos Relacionados</Label>
      
      {/* Selected Articles */}
      {selectedArticles.length > 0 && (
        <div className="flex flex-col gap-2 mb-2">
          {selectedArticles.map(article => (
            <div
              key={article.id}
              className="flex items-center gap-3 p-2 rounded-md border bg-secondary/30"
            >
              {article.image ? (
                <div className="relative w-16 h-12 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="w-16 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{article.title}</p>
                <p className="text-xs text-muted-foreground">{article.category}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 flex-shrink-0"
                onClick={() => handleRemove(article.id)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Article Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between cursor-pointer"
            disabled={disabled || !canAddMore}
          >
            {canAddMore
              ? `Selecionar artigo (${selectedIds.length}/${maxSelection})`
              : `Máximo de ${maxSelection} artigos selecionados`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Buscar artigos..." 
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                {loading ? 'Carregando...' : 'Nenhum artigo encontrado'}
              </CommandEmpty>
              <CommandGroup>
                {articles
                  .filter(article => 
                    article.title.toLowerCase().includes(search.toLowerCase()) ||
                    article.category.toLowerCase().includes(search.toLowerCase())
                  )
                  .slice(0, 50)
                  .map(article => (
                    <CommandItem
                      key={article.id}
                      value={article.id}
                      onSelect={() => handleSelect(article.id)}
                      className="cursor-pointer flex items-center gap-2 py-2"
                    >
                      <Check
                        className={cn(
                          'h-4 w-4 flex-shrink-0',
                          selectedIds.includes(article.id) ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {article.image ? (
                        <div className="relative w-12 h-9 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-9 rounded bg-muted flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium text-sm truncate">{article.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {article.category}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      <p className="text-sm text-muted-foreground">
        Selecione até {maxSelection} artigos relacionados que serão exibidos ao final deste artigo
      </p>
    </div>
  );
}
