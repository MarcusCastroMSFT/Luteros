import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange?: (category: string) => void;
  basePath?: string;
}

export function CategoryFilter({ categories, activeCategory, onCategoryChange, basePath = '/articles' }: CategoryFilterProps) {
  return (
    <div role="group" aria-label="Categorias" className="flex w-full max-w-full justify-start gap-3 overflow-x-auto px-1 py-2 md:flex-wrap">
      {categories.map((category) => {
        const active = activeCategory === category;
        const href = category === 'Todos' ? basePath : `${basePath}?category=${encodeURIComponent(category)}`;
        return (
          <Button
            key={category}
            asChild={!onCategoryChange}
            variant={active ? 'default' : 'outline'}
            onClick={onCategoryChange ? () => onCategoryChange(category) : undefined}
            aria-pressed={onCategoryChange ? active : undefined}
            className={cn(
              'h-12 shrink-0 cursor-pointer whitespace-nowrap rounded-md px-5 text-base font-medium shadow-none focus-visible:ring-offset-2 motion-reduce:transition-none',
              active ? 'bg-brand-600 text-white hover:bg-brand-700' : 'border-brand-600/20 bg-background text-brand-700 hover:border-brand-600/50 hover:bg-brand-50',
            )}
          >
            {onCategoryChange ? category : <Link href={href} aria-current={active ? 'page' : undefined}>{category}</Link>}
          </Button>
        );
      })}
    </div>
  );
}
