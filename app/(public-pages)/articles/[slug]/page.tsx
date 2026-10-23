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
import { DEFAULT_SOCIAL_IMAGE } from '@/lib/social-images';
import { SITE_URL, absoluteUrl, stripHtml, truncateMeta } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
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
  const baseUrl = SITE_URL;
  const articleUrl = `${baseUrl}/articles/${article.slug}`;
  const isPaid = article.accessType === 'paid';

  // JSON-LD structured data for SEO (following schema.org best practices)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${articleUrl}#article`,
    url: articleUrl,
    headline: article.title.trim(),
    description: truncateMeta(article.metaDescription || article.excerpt, 300),
    image: article.image ? [absoluteUrl(article.image)] : undefined,
    author: {
      '@type': 'Person',
      name: article.author,
      url: article.authorSlug ? `${baseUrl}/specialists/${article.authorSlug}` : undefined,
    },
    datePublished: article.dateISO,
    dateModified: article.updatedAtISO ?? article.dateISO,
    publisher: { '@id': `${baseUrl}/#organization` },
    isPartOf: { '@id': `${baseUrl}/#website` },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    articleSection: article.category,
    keywords: article.tags?.length ? article.tags.join(', ') : undefined,
    // Strip HTML tags before counting words for an accurate wordCount
    wordCount: article.content
      ? stripHtml(article.content).split(/\s+/).filter(Boolean).length
      : undefined,
    timeRequired: `PT${article.readTime.replace(' min', '')}M`,
    inLanguage: 'pt-BR',
    isAccessibleForFree: !isPaid,
    // Tells search engines the paywall is a gated section, not cloaking.
    ...(isPaid && {
      hasPart: {
        '@type': 'WebPageElement',
        isAccessibleForFree: false,
        cssSelector: '#article-paywall',
      },
    }),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Artigos', item: `${baseUrl}/articles` },
      { '@type': 'ListItem', position: 3, name: article.title, item: articleUrl },
    ],
  };

  return (
    <>
      <JsonLd data={[jsonLd, breadcrumbJsonLd]} />
      
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
            <div id="article-paywall">
              <Paywall
                audience={article.targetAudience ?? 'general'}
                isAuthenticated={accessContext.isAuthenticated}
                redirectTo={`/articles/${article.slug}`}
              />
            </div>
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

  const baseUrl = SITE_URL;
  const articleUrl = `${baseUrl}/articles/${slug}`;
  const imageUrl = new URL(article.image?.trim() || DEFAULT_SOCIAL_IMAGE.url, baseUrl).href;

  // Prefer per-article meta fields when set by the editor. Excerpts can be long
  // paragraphs, so descriptions are trimmed to what search results actually show.
  const metaTitle = (article.metaTitle || article.title).trim();
  const metaDescription = truncateMeta(article.metaDescription || article.excerpt);
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
