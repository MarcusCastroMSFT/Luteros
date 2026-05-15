CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "blog_articles_title_trgm_idx" ON "blog_articles" USING gin ("title" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blog_articles_excerpt_trgm_idx" ON "blog_articles" USING gin ("excerpt" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blog_articles_category_trgm_idx" ON "blog_articles" USING gin ("category" gin_trgm_ops);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "courses_title_trgm_idx" ON "courses" USING gin ("title" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "courses_description_trgm_idx" ON "courses" USING gin ("description" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "courses_category_trgm_idx" ON "courses" USING gin ("category" gin_trgm_ops);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "events_title_trgm_idx" ON "events" USING gin ("title" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_description_trgm_idx" ON "events" USING gin ("description" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_location_trgm_idx" ON "events" USING gin ("location" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_fullDescription_trgm_idx" ON "events" USING gin ("fullDescription" gin_trgm_ops);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "products_title_trgm_idx" ON "products" USING gin ("title" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_shortDescription_trgm_idx" ON "products" USING gin ("shortDescription" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_category_trgm_idx" ON "products" USING gin ("category" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_promoCode_trgm_idx" ON "products" USING gin ("promoCode" gin_trgm_ops);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "product_partners_name_trgm_idx" ON "product_partners" USING gin ("name" gin_trgm_ops);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "community_posts_title_trgm_idx" ON "community_posts" USING gin ("title" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "community_posts_content_trgm_idx" ON "community_posts" USING gin ("content" gin_trgm_ops);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "users_name_trgm_idx" ON "users" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_displayName_trgm_idx" ON "users" USING gin ("displayName" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_email_trgm_idx" ON "users" USING gin ("email" gin_trgm_ops);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "newsletter_subscribers_email_trgm_idx" ON "newsletter_subscribers" USING gin ("email" gin_trgm_ops);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "newsletter_campaigns_name_trgm_idx" ON "newsletter_campaigns" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "newsletter_campaigns_subject_trgm_idx" ON "newsletter_campaigns" USING gin ("subject" gin_trgm_ops);
