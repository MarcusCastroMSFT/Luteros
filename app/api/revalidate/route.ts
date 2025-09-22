import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, slug, secret } = body;

    // Verify the secret to prevent unauthorized revalidation
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { message: 'Invalid secret' },
        { status: 401 }
      );
    }

    switch (type) {
      case 'article':
        if (slug) {
          // Revalidate specific article
          revalidateTag(`article-${slug}`);
          revalidatePath(`/blog/${slug}`);
          console.log(`Revalidated article: ${slug}`);
        } else {
          // Revalidate all articles
          revalidateTag('articles');
          revalidatePath('/blog');
          console.log('Revalidated all articles');
        }
        break;
      
      case 'blog':
      case 'articles':
        // Revalidate entire blog section
        revalidatePath('/blog');
        revalidateTag('articles');
        revalidateTag('blog-listing');
        console.log('Revalidated entire blog section');
        break;
      
      case 'new-article':
        // When a new article is created in the database
        revalidateTag('articles');
        revalidateTag('blog-listing');
        revalidatePath('/blog');
        if (slug) {
          revalidateTag(`article-${slug}`);
          revalidatePath(`/blog/${slug}`);
        }
        console.log(`New article created: ${slug || 'unknown'}`);
        break;
      
      case 'delete-article':
        // When an article is deleted from the database
        revalidateTag('articles');
        revalidateTag('blog-listing');
        revalidatePath('/blog');
        if (slug) {
          revalidateTag(`article-${slug}`);
        }
        console.log(`Article deleted: ${slug || 'unknown'}`);
        break;
      
      default:
        return NextResponse.json(
          { message: 'Invalid revalidation type. Use: article, blog, new-article, delete-article' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      type,
      slug: slug || null,
      message: 'Successfully revalidated',
    });

  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: 'Error revalidating', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
