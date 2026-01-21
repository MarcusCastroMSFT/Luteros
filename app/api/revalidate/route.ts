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
          revalidateTag(`article-${slug}`, {});
          revalidatePath(`/blog/${slug}`);
          console.log(`Revalidated article: ${slug}`);
        } else {
          // Revalidate all articles
          revalidateTag('articles', {});
          revalidateTag('articles-initial', {});
          revalidateTag('article-slugs', {});
          revalidatePath('/blog');
          console.log('Revalidated all articles');
        }
        break;
      
      case 'blog':
      case 'articles':
        // Revalidate entire blog section
        revalidatePath('/blog');
        revalidateTag('articles', {});
        revalidateTag('articles-initial', {});
        revalidateTag('article-slugs', {});
        console.log('Revalidated entire blog section');
        break;
      
      case 'new-article':
        // When a new article is created in the database
        revalidateTag('articles', {});
        revalidateTag('articles-initial', {});
        revalidateTag('article-slugs', {});
        revalidatePath('/blog');
        if (slug) {
          revalidateTag(`article-${slug}`, {});
          revalidatePath(`/blog/${slug}`);
        }
        console.log(`New article created: ${slug || 'unknown'}`);
        break;
      
      case 'delete-article':
        // When an article is deleted from the database
        revalidateTag('articles', {});
        revalidateTag('articles-initial', {});
        revalidateTag('article-slugs', {});
        revalidatePath('/blog');
        if (slug) {
          revalidateTag(`article-${slug}`, {});
        }
        console.log(`Article deleted: ${slug || 'unknown'}`);
        break;
      
      case 'product':
        if (slug) {
          // Revalidate specific product
          revalidateTag(`product-${slug}`, {});
          revalidatePath(`/products/${slug}`);
          console.log(`Revalidated product: ${slug}`);
        } else {
          // Revalidate all products
          revalidateTag('products', {});
          revalidatePath('/products');
          console.log('Revalidated all products');
        }
        break;
      
      case 'products':
        // Revalidate entire products section
        revalidateTag('products', {});
        revalidateTag('featured-products', {});
        revalidateTag('product-slugs', {});
        revalidatePath('/products');
        console.log('Revalidated entire products section');
        break;
      
      case 'new-product':
        // When a new product is created
        revalidateTag('products', {});
        revalidateTag('product-slugs', {});
        revalidatePath('/products');
        if (slug) {
          revalidateTag(`product-${slug}`, {});
          revalidatePath(`/products/${slug}`);
        }
        console.log(`New product created: ${slug || 'unknown'}`);
        break;
      
      case 'delete-product':
        // When a product is deleted
        revalidateTag('products', {});
        revalidateTag('product-slugs', {});
        revalidatePath('/products');
        if (slug) {
          revalidateTag(`product-${slug}`, {});
        }
        console.log(`Product deleted: ${slug || 'unknown'}`);
        break;
      
      case 'event':
        if (slug) {
          // Revalidate specific event
          revalidateTag(`event-${slug}`, {});
          revalidatePath(`/events/${slug}`);
          console.log(`Revalidated event: ${slug}`);
        } else {
          // Revalidate all events
          revalidateTag('events', {});
          revalidatePath('/events');
          console.log('Revalidated all events');
        }
        break;
      
      case 'events':
        // Revalidate entire events section
        revalidateTag('events', {});
        revalidateTag('events-initial', {});
        revalidateTag('event-slugs', {});
        revalidateTag('upcoming-events-count', {});
        revalidatePath('/events');
        console.log('Revalidated entire events section');
        break;
      
      case 'new-event':
        // When a new event is created
        revalidateTag('events', {});
        revalidateTag('events-initial', {});
        revalidateTag('event-slugs', {});
        revalidateTag('upcoming-events-count', {});
        revalidatePath('/events');
        if (slug) {
          revalidateTag(`event-${slug}`, {});
          revalidatePath(`/events/${slug}`);
        }
        console.log(`New event created: ${slug || 'unknown'}`);
        break;
      
      case 'delete-event':
        // When an event is deleted
        revalidateTag('events', {});
        revalidateTag('events-initial', {});
        revalidateTag('event-slugs', {});
        revalidateTag('upcoming-events-count', {});
        revalidatePath('/events');
        if (slug) {
          revalidateTag(`event-${slug}`, {});
        }
        console.log(`Event deleted: ${slug || 'unknown'}`);
        break;
      
      default:
        return NextResponse.json(
          { message: 'Invalid revalidation type. Use: article, blog, new-article, delete-article, product, products, new-product, delete-product, event, events, new-event, delete-event' },
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
