import type { BrandIconName } from '@/components/brand/brand-icon';

export interface HelpLink {
  href: string;
  label: string;
}

export interface HelpSection {
  heading?: string;
  paragraphs?: string[];
  steps?: string[];
  bullets?: string[];
  links?: HelpLink[];
}

export interface HelpArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
  icon: BrandIconName;
  sections: HelpSection[];
  related: string[];
}

export interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: BrandIconName;
  articleSlugs: string[];
}
