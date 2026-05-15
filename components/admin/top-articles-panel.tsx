import Link from 'next/link';
import { Eye, MessageCircle, Heart, ArrowRight, FileText } from 'lucide-react';
import { ArticleAccessBadge } from '@/components/blog/article-access-badges';

interface TopArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  accessType: string;
}

interface Props {
  articles: TopArticle[];
}

export function TopArticlesPanel({ articles }: Props) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <header className="flex items-center justify-between border-b border-gray-100 p-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Artigos com mais alcance</h2>
          <p className="text-xs text-gray-500 mt-0.5">Por visualizações e engajamento</p>
        </div>
        <Link
          href="/admin/articles"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      </header>

      {articles.length === 0 ? (
        <div className="p-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300 mb-2" aria-hidden />
          <p className="text-sm text-gray-500">Nenhum artigo publicado ainda</p>
          <Link
            href="/admin/articles/new"
            className="mt-3 inline-flex text-xs font-medium text-primary hover:underline"
          >
            Criar primeiro artigo
          </Link>
        </div>
      ) : (
        <ol className="divide-y divide-gray-100">
          {articles.map((article, i) => (
            <li key={article.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 tabular-nums">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/articles/${article.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-900 hover:text-primary truncate"
                  >
                    {article.title}
                  </Link>
                  <ArticleAccessBadge accessType={article.accessType} />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{article.category}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                <span className="inline-flex items-center gap-1" title="Visualizações">
                  <Eye className="h-3.5 w-3.5" /> {article.viewCount.toLocaleString('pt-BR')}
                </span>
                <span className="inline-flex items-center gap-1" title="Comentários">
                  <MessageCircle className="h-3.5 w-3.5" /> {article.commentCount}
                </span>
                <span className="inline-flex items-center gap-1" title="Curtidas">
                  <Heart className="h-3.5 w-3.5" /> {article.likeCount}
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
