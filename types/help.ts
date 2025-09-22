export interface HelpArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  lastUpdated: string;
  isPopular?: boolean;
  difficulty: 'easy' | 'medium' | 'advanced';
  relatedArticles: string[];
}

export interface HelpCategoryArticle {
  id: string;
  title: string;
  description: string;
  readTime: string;
  isPopular?: boolean;
  href: string;
}

export interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: string; // Icon name as string for serialization
  articles: HelpCategoryArticle[];
}

export interface PopularArticle {
  title: string;
  href: string;
  views: string;
}

export interface QuickAction {
  title: string;
  description: string;
  icon: string;
  action: string;
  available: boolean;
}

export interface HelpPageData {
  categories: HelpCategory[];
  popularArticles: PopularArticle[];
  quickActions: QuickAction[];
  success: boolean;
}
