import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArticleHeader } from '@/components/blog/articleHeader';
import { ArticleContent } from '@/components/blog/articleContent';
import { sampleArticles } from '@/data/articles';
import { type Article } from '@/types/blog';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import non-critical components for better performance
const ArticleShare = dynamic(() => import('@/components/blog/articleShare').then(mod => ({ default: mod.ArticleShare })), {
  loading: () => <Skeleton className="h-24 w-full" />
});
const AuthorBio = dynamic(() => import('@/components/blog/authorBio').then(mod => ({ default: mod.AuthorBio })), {
  loading: () => <Skeleton className="h-32 w-full" />
});
const RelatedArticles = dynamic(() => import('@/components/blog/relatedArticles').then(mod => ({ default: mod.RelatedArticles })), {
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

// Fetch article data from database API with ISR
async function getArticleData(slug: string): Promise<{ article: Article; relatedArticles: Article[] } | null> {
  try {
    // Always try to fetch from API first (database-driven)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/blog/${slug}`, {
      // ISR: Revalidate every 30 minutes, serve stale content while revalidating
      next: { 
        revalidate: 1800, // 30 minutes
        tags: [`article-${slug}`, 'articles'] // Tags for on-demand revalidation
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(15000) // Increased to 15 seconds
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

    // If API fails, try fallback to static data (for development/build)
    console.warn(`API fetch failed for article ${slug}, using fallback`);
    const article = sampleArticles.find(a => a.slug === slug);
    
    if (!article) {
      return null;
    }

    const relatedArticles = sampleArticles
      .filter(a => a.category === article.category && a.slug !== slug)
      .slice(0, 3);
    
    return { article, relatedArticles };
  } catch (error) {
    console.error('Error fetching article data:', error);
    
    // Emergency fallback to static data
    const article = sampleArticles.find(a => a.slug === slug);
    if (article) {
      const relatedArticles = sampleArticles
        .filter(a => a.category === article.category && a.slug !== slug)
        .slice(0, 3);
      return { article, relatedArticles };
    }
    
    return null;
  }
}

// Generate static params with ISR - fetch initial articles from database
export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Try to fetch article slugs from database API
    const response = await fetch(`${baseUrl}/api/blog`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data && result.data.articles) {
        return result.data.articles.map((article: Article) => ({
          slug: article.slug,
        }));
      }
    }
    
    console.warn('API fetch failed during generateStaticParams, using fallback data');
    
    // Fallback to sample articles during build/development
    return sampleArticles.map((article) => ({
      slug: article.slug,
    }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    
    // Always return sample data as last resort to prevent build failure
    return sampleArticles.map((article) => ({
      slug: article.slug,
    }));
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  
  // Fetch article data with ISR support
  const articleData = await getArticleData(slug);
  
  if (!articleData) {
    notFound();
  }

  const { article, relatedArticles } = articleData;

  // Generate full URL for sharing (in a real app, this would be dynamic)
  const articleUrl = `https://luteros.com/blog/${article.slug}`;

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.image,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    datePublished: article.date,
    publisher: {
      '@type': 'Organization',
      name: 'Luteros',
      logo: {
        '@type': 'ImageObject',
        url: 'https://luteros.com/logo.png',
      },
    },
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
    };
  }

  const { article } = articleData;

  return {
    title: `${article.title} | Luteros Blog`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.image],
      type: 'article',
      authors: [article.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [article.image],
    },
  };
}
