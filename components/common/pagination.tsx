import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void; // Optional for client-side navigation
  basePath?: string; // For server-side navigation via URL
  queryParams?: Record<string, string | undefined>; // Additional query params to preserve
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  basePath = '/blog',
  queryParams = {}
}: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages();

  // Helper to build URL with query params
  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page.toString());
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  // If onPageChange is provided, use client-side navigation
  if (onPageChange) {
    return (
      <div className="flex items-center justify-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 p-0 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {visiblePages.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-2 py-1 text-sm text-gray-500">...</span>
            ) : (
              <Button
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(Number(page))}
                className="h-8 w-8 p-0 cursor-pointer"
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 w-8 p-0 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Server-side navigation via URL
  return (
    <div className="flex items-center justify-center space-x-2">
      {currentPage > 1 ? (
        <Link href={buildUrl(currentPage - 1)}>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="h-8 w-8 p-0 cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {visiblePages.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-2 py-1 text-sm text-gray-500">...</span>
          ) : (
            <Link href={buildUrl(Number(page))}>
              <Button
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                className="h-8 w-8 p-0 cursor-pointer"
              >
                {page}
              </Button>
            </Link>
          )}
        </React.Fragment>
      ))}

      {currentPage < totalPages ? (
        <Link href={buildUrl(currentPage + 1)}>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="h-8 w-8 p-0 cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
