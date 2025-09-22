export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  authorSlug: string;
  date: string;
  readTime: string;
  commentCount?: number;
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
