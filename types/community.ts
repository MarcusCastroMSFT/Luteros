export interface CommunityReply {
  id: string;
  content: string;
  author: string;
  isAnonymous: boolean;
  createdDate: string;
  likes: number;
  isReported: boolean;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: string;
  category: "Gravidez" | "Pós-parto" | "Suporte Contínuo" | "Paternidade" | "Fertilidade" | "Menopausa";
  subcategory: string;
  status: "Ativo" | "Fechado" | "Moderação";
  replies: CommunityReply[];
  repliesCount: number;
  likes: number;
  isAnonymous: boolean;
  createdDate: string;
  lastReply: string;
  tags: string[];
  isReported: boolean;
  hasReportedReplies?: boolean;
}

export interface CommunityPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CommunityApiResponse {
  data: CommunityPost[];
  totalCount: number;
  pageCount: number;
  pagination: CommunityPagination;
}

export interface CommunityCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  subcategories?: string[];
}

export interface CommunityPageProps {
  posts: CommunityPost[];
  pagination: CommunityPagination;
  selectedCategory?: string;
}
