import React from 'react';
import { notFound } from 'next/navigation';
import nextDynamic from 'next/dynamic';
import { ArticleHeader } from '@/components/blog/articleHeader';
import { ArticleContent } from '@/components/blog/articleContent';
import { type Article } from '@/types/blog';
import { Skeleton } from '@/components/ui/skeleton';

// ISR: Revalidate every 30 minutes, with on-demand revalidation when articles are updated
export const revalidate = 1800; // 30 minutes in seconds

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

// Fetch article data from database
async function getArticleData(slug: string): Promise<{ article: Article; relatedArticles: Article[] } | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/blog/${slug}`, {
      // Use ISR cache - revalidates based on route segment config
      next: { revalidate: 1800, tags: ['articles', `article-${slug}`] },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(15000)
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        return {
          article: result.data.article,
          relatedArticles: result.data.relatedArticles || []
        };
      }
    }

    console.error(`API fetch failed for article ${slug}`);
    return null;
  } catch (error) {
    console.error('Error fetching article data:', error);
    return null;
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  
  // Fetch article data from database
  const articleData = await getArticleData(slug);
  
  if (!articleData) {
    notFound();
  }

  const { article, relatedArticles } = articleData;

  // Generate full URL for sharing
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://luteros.com';
  const articleUrl = `${baseUrl}/blog/${article.slug}`;

  // JSON-LD structured data for SEO (following schema.org best practices)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': articleUrl,
    headline: article.title,
    description: article.excerpt,
    image: article.image ? {
      '@type': 'ImageObject',
      url: article.image.startsWith('http') ? article.image : `${baseUrl}${article.image}`,
    } : undefined,
    author: {
      '@type': 'Person',
      name: article.author,
      url: article.authorSlug ? `${baseUrl}/specialists/${article.authorSlug}` : undefined,
    },
    datePublished: article.date,
    dateModified: article.date,
    publisher: {
      '@type': 'Organization',
      name: 'Luteros',
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
    wordCount: article.content ? article.content.split(/\s+/).length : undefined,
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
            title={article.title}
            excerpt={article.excerpt}
            image={article.image}
            category={article.category}
            author={article.author}
            date={article.date}
            readTime={article.readTime}
            commentCount={article.commentCount}
          />

          {/* Article Content */}
          <ArticleContent content={article.content} className="mb-12" />

          {/* Share Section */}
          <div className="border-t border-b border-gray-200 dark:border-gray-700 py-8 mb-12">
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
            className="mb-16"
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
    </>
  );
}

// Generate metadata for SEO with ISR support
export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const articleData = await getArticleData(slug);
  
  if (!articleData) {
    return {
      title: 'Artigo não encontrado',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { article } = articleData;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://luteros.com';
  const articleUrl = `${baseUrl}/blog/${slug}`;
  const imageUrl = article.image?.startsWith('http') 
    ? article.image 
    : `${baseUrl}${article.image}`;

  return {
    title: article.title,
    description: article.excerpt,
    keywords: [article.category, 'saúde sexual', 'educação', 'bem-estar'],
    authors: [{ name: article.author }],
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: articleUrl,
      siteName: 'Luteros',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      type: 'article',
      publishedTime: article.date,
      authors: [article.author],
      section: article.category,
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
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
