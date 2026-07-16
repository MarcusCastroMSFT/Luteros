import React from 'react';
import { notFound } from 'next/navigation';
import nextDynamic from 'next/dynamic';
import { ArticleHeader } from '@/components/blog/articleHeader';
import { ArticleContent } from '@/components/blog/articleContent';
import { ArticleReferences } from '@/components/blog/article-references';
import { FloatingBookmarkButton } from '@/components/blog/floating-bookmark-button';
import { Paywall } from '@/components/blog/paywall';
import { Skeleton } from '@/components/ui/skeleton';
import { getArticleBySlug, getArticleMetadata, getAllArticleSlugs } from '@/lib/articles';
import {
  getCurrentUserAccessContext,
  hasArticleAccess,
  truncateHtmlContent,
} from '@/lib/subscriptions';

const PAYWALL_PREVIEW_CHARS = 500;

// Dynamically import non-critical components for better performance
const ArticleShare = nextDynamic(() => import('@/components/blog/articleShare').then(mod => ({ default: mod.ArticleShare })), {
  loading: () => <Skeleton className="h-24 w-full" />
});
const AuthorBio = nextDynamic(() => import('@/components/blog/authorBio').then(mod => ({ default: mod.AuthorBio })), {
  loading: () => <Skeleton className="h-32 w-full" />
});
const RelatedArticles = nextDynamic(() => import('@/components/blog/relatedArticles').then(mod => ({ default: mod.RelatedArticles })), {
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton className="h-80 w-full" />
      <Skeleton className="h-80 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  )
});

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Pre-render all published article slugs at build time for optimal performance
export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  // Fetch article data directly from database (cached, full content)
  const articleData = await getArticleBySlug(slug);

  if (!articleData) {
    notFound();
  }

  const { article, relatedArticles } = articleData;

  // Access check happens OUTSIDE the cached article fetch so the cache stays
  // per-article, not per-user. Each render does one quick subscription read.
  const accessContext = await getCurrentUserAccessContext();
  const isGated = !hasArticleAccess(
    { accessType: article.accessType ?? 'free', targetAudience: article.targetAudience ?? 'general' },
    accessContext,
  );
  const displayContent = isGated && article.content
    ? truncateHtmlContent(article.content, PAYWALL_PREVIEW_CHARS)
    : article.content;

  // Generate full URL for sharing
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.lutteros.com.br';
  const articleUrl = `${baseUrl}/articles/${article.slug}`;

  // JSON-LD structured data for SEO (following schema.org best practices)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': articleUrl,
    headline: article.title,
    description: article.metaDescription || article.excerpt,
    image: article.image ? {
      '@type': 'ImageObject',
      url: article.image.startsWith('http') ? article.image : `${baseUrl}${article.image}`,
    } : undefined,
    author: {
      '@type': 'Person',
      name: article.author,
      url: article.authorSlug ? `${baseUrl}/specialists/${article.authorSlug}` : undefined,
    },
    datePublished: article.dateISO,
    dateModified: article.updatedAtISO ?? article.dateISO,
    publisher: {
      '@type': 'Organization',
      name: 'lutteros',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo.png`,
        width: 200,
        height: 60,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    articleSection: article.category,
    keywords: article.tags?.length ? article.tags.join(', ') : undefined,
    // Strip HTML tags before counting words for an accurate wordCount
    wordCount: article.content
      ? article.content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
      : undefined,
    timeRequired: `PT${article.readTime.replace(' min', '')}M`,
    inLanguage: 'pt-BR',
  };

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Article Content */}
      <div className="container mx-auto px-4 max-w-[1428px] py-16">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <ArticleHeader
            articleId={article.id}
            title={article.title}
            excerpt={article.excerpt}
            image={article.image}
            category={article.category}
            author={article.author}
            date={article.date}
            readTime={article.readTime}
            commentCount={article.commentCount}
            accessType={article.accessType}
            targetAudience={article.targetAudience}
          />

          {/* Article Content (truncated if paywalled) */}
          <ArticleContent content={displayContent} className="mb-12" />

          {/* References — only when unlocked (paywalled previews don't reveal sources) */}
          {!isGated && article.references && (
            <ArticleReferences html={article.references} className="mb-12" />
          )}

          {isGated && (
            <Paywall
              audience={article.targetAudience ?? 'general'}
              isAuthenticated={accessContext.isAuthenticated}
              redirectTo={`/articles/${article.slug}`}
            />
          )}

          {/* Share Section */}
          <div className="border-t border-b border-gray-200 py-8 mb-12">
            <ArticleShare
              title={article.title}
              url={articleUrl}
            />
          </div>

          {/* Author Bio */}
          <AuthorBio
            author={article.author}
            avatar={article.authorAvatar}
            authorSlug={article.authorSlug || ''}
            className="mb-8 sm:mb-16"
          />
        </div>

        {/* Related Articles */}
        <RelatedArticles
          articles={relatedArticles}
          currentArticleId={article.id}
          limit={3}
          className="max-w-6xl mx-auto"
        />
      </div>

      {/* Floating Bookmark Button */}
      <FloatingBookmarkButton articleId={article.id} />
    </>
  );
}

// Generate metadata for SEO with ISR support
export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleMetadata(slug);
  
  if (!article) {
    return {
      title: 'Artigo não encontrado',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.lutteros.com.br';
  const articleUrl = `${baseUrl}/articles/${slug}`;
  const imageUrl = article.image?.startsWith('http') 
    ? article.image 
    : `${baseUrl}${article.image}`;

  // Prefer per-article meta fields when set by the editor
  const metaTitle = article.metaTitle || article.title;
  const metaDescription = article.metaDescription || article.excerpt;
  const keywords = article.tags?.length
    ? article.tags
    : [article.category, 'saúde sexual', 'educação', 'bem-estar'];

  return {
    title: metaTitle,
    description: metaDescription,
    keywords,
    authors: [{ name: article.author }],
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: articleUrl,
      siteName: 'lutteros',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
      type: 'article',
      publishedTime: article.date,          // ISO string from getArticleMetadata
      modifiedTime: article.updatedAt,      // ISO string from getArticleMetadata
      authors: [article.author],
      section: article.category,
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  };
}
