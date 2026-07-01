export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  references?: string | null;
  image: string;
  category: string;
  author: string;
  authorSlug: string;
  authorAvatar?: string;
  date: string;
  /** ISO 8601 publish date — use for JSON-LD / OG tags */
  dateISO?: string;
  /** ISO 8601 last-updated date — use for JSON-LD dateModified / OG article:modified_time */
  updatedAtISO?: string;
  readTime: string;
  commentCount?: number;
  accessType?: 'free' | 'paid';
  targetAudience?: 'general' | 'doctors';
  metaTitle?: string | null;
  metaDescription?: string | null;
  tags?: string[];
}

export interface BlogPagination {
  currentPage: number;
  totalPages: number;
  totalArticles: number;
  articlesPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface BlogApiResponse {
  success: boolean;
  data: {
    articles: Article[];
    pagination: BlogPagination;
    categories: string[];
  } | null;
  error?: string;
}

export interface ArticleApiResponse {
  success: boolean;
  data: {
    article: Article;
    relatedArticles: Article[];
  } | null;
  error?: string;
}

export interface ArticleCardProps {
  article: Article;
}

export interface ArticleListProps {
  articles?: Article[];
}

export interface LatestArticlesProps {
  articles?: Article[];
  limit?: number;
}
