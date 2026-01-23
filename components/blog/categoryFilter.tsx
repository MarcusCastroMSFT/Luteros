import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange?: (category: string) => void; // Optional for client-side navigation
  basePath?: string; // For server-side navigation via URL
}

export function CategoryFilter({ categories, activeCategory, onCategoryChange, basePath = '/blog' }: CategoryFilterProps) {
  // If onCategoryChange is provided, use client-side navigation
  if (onCategoryChange) {
    return (
      <div className="flex gap-2 justify-start md:justify-center overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap scrollbar-hide">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            onClick={() => onCategoryChange(category)}
            className="px-4 md:px-6 py-2 cursor-pointer whitespace-nowrap flex-shrink-0 text-sm md:text-base"
          >
            {category}
          </Button>
        ))}
      </div>
    );
  }

  // Server-side navigation via URL
  return (
    <div className="flex gap-2 justify-start md:justify-center overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap scrollbar-hide">
      {categories.map((category) => {
        const href = category === 'Todos' 
          ? basePath 
          : `${basePath}?category=${encodeURIComponent(category)}`;
        
        return (
          <Link key={category} href={href}>
            <Button
              variant={activeCategory === category ? "default" : "outline"}
              className="px-4 md:px-6 py-2 cursor-pointer whitespace-nowrap flex-shrink-0 text-sm md:text-base"
            >
              {category}
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
