'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const USER_PAGE_CONTAINER = 'mx-auto max-w-[1480px] px-6 pb-20 pt-6 sm:px-10 lg:px-12';

export const userCardClass =
  'group overflow-hidden rounded-[12px_36px_12px_12px] border border-brand-600/15 bg-white/60 transition-colors hover:bg-[#e4eeeb]/40 motion-reduce:transition-none';

export const userCardTitleClass =
  'mb-2 line-clamp-2 font-[family-name:var(--font-cardo)] text-2xl leading-tight text-brand-900 group-hover:text-brand-700 motion-reduce:transition-none';

export const loadMoreButtonClass =
  'h-12 cursor-pointer border-brand-600/30 bg-transparent px-6 text-base text-brand-700 shadow-none hover:bg-brand-50 hover:text-brand-700 motion-reduce:transition-none';

export function UserStat({ icon, value, label }: { icon: ReactNode; value: number | string; label: string }) {
  return (
    <div className="flex items-center gap-4 rounded-[12px_32px_12px_12px] border border-brand-600/15 bg-white/60 p-5 sm:p-6">
      <span aria-hidden="true" className="flex size-14 shrink-0 items-center justify-center rounded-[42%_58%_52%_38%] bg-[#e4eeeb] text-brand-700">
        {icon}
      </span>
      <div>
        <p className="font-[family-name:var(--font-cardo)] text-3xl leading-none text-brand-900">{value}</p>
        <p className="mt-1 text-sm text-slate-600">{label}</p>
      </div>
    </div>
  );
}

export function FilterTabs<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex w-full max-w-full justify-start gap-3 overflow-x-auto px-1 py-2 md:flex-wrap">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Button
            key={option.value}
            type="button"
            variant={active ? 'default' : 'outline'}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'h-12 shrink-0 cursor-pointer whitespace-nowrap rounded-md px-5 text-base font-medium shadow-none focus-visible:ring-offset-2 motion-reduce:transition-none',
              active ? 'bg-brand-600 text-white hover:bg-brand-700' : 'border-brand-600/20 bg-background text-brand-700 hover:border-brand-600/50 hover:bg-brand-50',
            )}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}

export function UserCardSkeleton({ imageHeight = 'h-40' }: { imageHeight?: string }) {
  return (
    <div aria-hidden="true" className="animate-pulse overflow-hidden rounded-[12px_36px_12px_12px] border border-brand-600/15 bg-white/60 motion-reduce:animate-none">
      <div className={cn('bg-[#e4eeeb]', imageHeight)} />
      <div className="space-y-3 p-5">
        <div className="h-4 w-1/3 rounded bg-[#e4eeeb]" />
        <div className="h-6 w-3/4 rounded bg-[#e4eeeb]" />
        <div className="h-4 w-1/2 rounded bg-[#e4eeeb]" />
        <div className="h-2 w-full rounded bg-[#e4eeeb]" />
      </div>
    </div>
  );
}
