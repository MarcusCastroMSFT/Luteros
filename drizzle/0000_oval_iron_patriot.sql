CREATE TYPE "public"."CampaignStatus" AS ENUM('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."CommunityPostStatus" AS ENUM('ACTIVE', 'CLOSED', 'MODERATION');--> statement-breakpoint
CREATE TYPE "public"."LessonType" AS ENUM('video', 'article', 'audio');--> statement-breakpoint
CREATE TYPE "public"."NewsletterStatus" AS ENUM('PENDING', 'ACTIVE', 'UNSUBSCRIBED');--> statement-breakpoint
CREATE TYPE "public"."SubscriptionStatus" AS ENUM('ACTIVE', 'INACTIVE', 'CANCELLED', 'TRIAL');--> statement-breakpoint
CREATE TYPE "public"."SubscriptionTier" AS ENUM('FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE');--> statement-breakpoint
CREATE TYPE "public"."SystemEmailCategory" AS ENUM('AUTHENTICATION', 'ACCOUNT', 'NOTIFICATION', 'TRANSACTION', 'ENGAGEMENT');--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('ADMIN', 'INSTRUCTOR', 'USER', 'PROFESSIONAL');--> statement-breakpoint
CREATE TABLE "accounts" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "blog_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"image" text,
	"coverImage" text,
	"authorId" text NOT NULL,
	"category" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"metaTitle" text,
	"metaDescription" text,
	"readTime" integer NOT NULL,
	"viewCount" integer DEFAULT 0 NOT NULL,
	"commentCount" integer DEFAULT 0 NOT NULL,
	"likeCount" integer DEFAULT 0 NOT NULL,
	"isPublished" boolean DEFAULT false NOT NULL,
	"publishedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"relatedArticleIds" uuid[] DEFAULT '{}' NOT NULL,
	"accessType" text DEFAULT 'free' NOT NULL,
	"targetAudience" text DEFAULT 'general' NOT NULL,
	CONSTRAINT "blog_articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"articleId" uuid NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"articleId" uuid NOT NULL,
	"userId" text NOT NULL,
	"content" text NOT NULL,
	"isPublished" boolean DEFAULT true NOT NULL,
	"isReported" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"articleId" uuid NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"courseId" uuid NOT NULL,
	"certificateNumber" text NOT NULL,
	"issuedAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp,
	"verificationUrl" text,
	CONSTRAINT "certificates_certificateNumber_unique" UNIQUE("certificateNumber")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"entityType" text NOT NULL,
	"entityId" uuid NOT NULL,
	"content" text NOT NULL,
	"isPublished" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"postId" uuid NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"userId" text NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"isAnonymous" boolean DEFAULT false NOT NULL,
	"status" "CommunityPostStatus" DEFAULT 'ACTIVE' NOT NULL,
	"isReported" boolean DEFAULT false NOT NULL,
	"isPinned" boolean DEFAULT false NOT NULL,
	"viewCount" integer DEFAULT 0 NOT NULL,
	"replyCount" integer DEFAULT 0 NOT NULL,
	"likeCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastReplyAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "community_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"postId" uuid NOT NULL,
	"userId" text NOT NULL,
	"content" text NOT NULL,
	"isAnonymous" boolean DEFAULT false NOT NULL,
	"isReported" boolean DEFAULT false NOT NULL,
	"likeCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_reply_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"replyId" uuid NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entityType" text NOT NULL,
	"entityId" uuid NOT NULL,
	"reporterId" text NOT NULL,
	"reason" text NOT NULL,
	"details" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"courseId" uuid NOT NULL,
	"completedLessons" integer DEFAULT 0 NOT NULL,
	"totalLessons" integer NOT NULL,
	"progressPercent" integer DEFAULT 0 NOT NULL,
	"lastAccessedAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"shortDescription" text,
	"level" text NOT NULL,
	"category" text NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"duration" integer,
	"thumbnail" text,
	"coverImage" text,
	"previewVideo" text,
	"instructorId" text NOT NULL,
	"price" numeric(10, 2),
	"discountPrice" numeric(10, 2),
	"isFree" boolean DEFAULT false NOT NULL,
	"isPublished" boolean DEFAULT false NOT NULL,
	"publishedAt" timestamp,
	"enrollmentCount" integer DEFAULT 0 NOT NULL,
	"averageRating" numeric(3, 2),
	"reviewCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"courseId" uuid NOT NULL,
	"enrolledAt" timestamp DEFAULT now() NOT NULL,
	"completedAt" timestamp,
	"expiresAt" timestamp,
	"progressPercent" integer DEFAULT 0 NOT NULL,
	"paidAmount" numeric(10, 2),
	"paymentStatus" text
);
--> statement-breakpoint
CREATE TABLE "event_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"eventId" uuid NOT NULL,
	"userId" text NOT NULL,
	"registeredAt" timestamp DEFAULT now() NOT NULL,
	"attended" boolean DEFAULT false NOT NULL,
	"paidAmount" numeric(10, 2),
	"paymentStatus" text
);
--> statement-breakpoint
CREATE TABLE "event_speakers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"eventId" uuid NOT NULL,
	"name" text NOT NULL,
	"title" text,
	"bio" text,
	"image" text,
	"linkedin" text,
	"twitter" text,
	"website" text,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"fullDescription" text,
	"location" text NOT NULL,
	"eventDate" timestamp NOT NULL,
	"eventTime" text NOT NULL,
	"duration" integer,
	"image" text,
	"totalSlots" integer NOT NULL,
	"cost" numeric(10, 2),
	"isFree" boolean DEFAULT false NOT NULL,
	"isPublished" boolean DEFAULT false NOT NULL,
	"isCancelled" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"lessonId" uuid NOT NULL,
	"isCompleted" boolean DEFAULT false NOT NULL,
	"completedAt" timestamp,
	"watchedDuration" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"courseId" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" text,
	"videoUrl" text,
	"duration" integer,
	"order" integer NOT NULL,
	"sectionTitle" text,
	"isPublished" boolean DEFAULT false NOT NULL,
	"isFree" boolean DEFAULT false NOT NULL,
	"type" "LessonType" DEFAULT 'video' NOT NULL,
	"videoProvider" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"previewText" text,
	"content" text NOT NULL,
	"ctaText" text,
	"ctaUrl" text,
	"status" "CampaignStatus" DEFAULT 'DRAFT' NOT NULL,
	"errorMessage" text,
	"scheduledAt" timestamp,
	"sentAt" timestamp,
	"totalRecipients" integer DEFAULT 0 NOT NULL,
	"sentCount" integer DEFAULT 0 NOT NULL,
	"failedCount" integer DEFAULT 0 NOT NULL,
	"createdById" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"status" "NewsletterStatus" DEFAULT 'ACTIVE' NOT NULL,
	"unsubscribeToken" uuid DEFAULT gen_random_uuid() NOT NULL,
	"source" text,
	"ipAddress" text,
	"confirmedAt" timestamp,
	"unsubscribedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email"),
	CONSTRAINT "newsletter_subscribers_unsubscribeToken_unique" UNIQUE("unsubscribeToken")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"actionUrl" text,
	"isRead" boolean DEFAULT false NOT NULL,
	"readAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"website" text,
	"description" text,
	"email" text,
	"phone" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_partners_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"shortDescription" text NOT NULL,
	"image" text,
	"partnerId" uuid NOT NULL,
	"discountPercentage" integer DEFAULT 0 NOT NULL,
	"discountType" text DEFAULT 'percentage' NOT NULL,
	"originalPrice" numeric(10, 2),
	"discountedPrice" numeric(10, 2),
	"discountAmount" numeric(10, 2),
	"promoCode" text NOT NULL,
	"category" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"availability" text DEFAULT 'all' NOT NULL,
	"validUntil" timestamp,
	"termsAndConditions" text,
	"howToUse" text[] DEFAULT '{}' NOT NULL,
	"features" text[] DEFAULT '{}' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"isFeatured" boolean DEFAULT false NOT NULL,
	"usageCount" integer DEFAULT 0 NOT NULL,
	"maxUsages" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"courseId" uuid NOT NULL,
	"rating" integer NOT NULL,
	"title" text,
	"comment" text,
	"isPublished" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_email_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" "SystemEmailCategory" NOT NULL,
	"subject" text NOT NULL,
	"previewText" text,
	"htmlContent" text NOT NULL,
	"textContent" text,
	"variables" text[] DEFAULT '{}' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"updatedById" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_email_templates_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" timestamp,
	"image" text,
	"password" text,
	"role" "UserRole" DEFAULT 'USER' NOT NULL,
	"displayName" text,
	"bio" text,
	"phone" text,
	"dateOfBirth" timestamp,
	"title" text,
	"company" text,
	"website" text,
	"linkedin" text,
	"twitter" text,
	"instagram" text,
	"rating" numeric(3, 2),
	"reviewsCount" integer DEFAULT 0 NOT NULL,
	"studentsCount" integer DEFAULT 0 NOT NULL,
	"coursesCount" integer DEFAULT 0 NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"emailNotifications" boolean DEFAULT true NOT NULL,
	"marketingEmails" boolean DEFAULT false NOT NULL,
	"lastLoginAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationTokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationTokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_articles" ADD CONSTRAINT "blog_articles_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_bookmarks" ADD CONSTRAINT "blog_bookmarks_articleId_blog_articles_id_fk" FOREIGN KEY ("articleId") REFERENCES "public"."blog_articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_bookmarks" ADD CONSTRAINT "blog_bookmarks_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_articleId_blog_articles_id_fk" FOREIGN KEY ("articleId") REFERENCES "public"."blog_articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_likes" ADD CONSTRAINT "blog_likes_articleId_blog_articles_id_fk" FOREIGN KEY ("articleId") REFERENCES "public"."blog_articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_likes" ADD CONSTRAINT "blog_likes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_likes" ADD CONSTRAINT "community_likes_postId_community_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."community_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_likes" ADD CONSTRAINT "community_likes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_replies" ADD CONSTRAINT "community_replies_postId_community_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."community_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_replies" ADD CONSTRAINT "community_replies_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_reply_likes" ADD CONSTRAINT "community_reply_likes_replyId_community_replies_id_fk" FOREIGN KEY ("replyId") REFERENCES "public"."community_replies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_reply_likes" ADD CONSTRAINT "community_reply_likes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_reports" ADD CONSTRAINT "community_reports_reporterId_users_id_fk" FOREIGN KEY ("reporterId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_courseId_courses_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_instructorId_users_id_fk" FOREIGN KEY ("instructorId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_courseId_courses_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_eventId_events_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_speakers" ADD CONSTRAINT "event_speakers_eventId_events_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lessonId_lessons_id_fk" FOREIGN KEY ("lessonId") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_courseId_courses_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_campaigns" ADD CONSTRAINT "newsletter_campaigns_createdById_users_id_fk" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_partnerId_product_partners_id_fk" FOREIGN KEY ("partnerId") REFERENCES "public"."product_partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_courseId_courses_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_email_templates" ADD CONSTRAINT "system_email_templates_updatedById_users_id_fk" FOREIGN KEY ("updatedById") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_userId_idx" ON "accounts" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "blog_articles_accessType_idx" ON "blog_articles" USING btree ("accessType");--> statement-breakpoint
CREATE INDEX "blog_articles_authorId_idx" ON "blog_articles" USING btree ("authorId");--> statement-breakpoint
CREATE INDEX "blog_articles_category_idx" ON "blog_articles" USING btree ("category");--> statement-breakpoint
CREATE INDEX "blog_articles_createdAt_idx" ON "blog_articles" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "blog_articles_isPublished_category_idx" ON "blog_articles" USING btree ("isPublished","category");--> statement-breakpoint
CREATE INDEX "blog_articles_isPublished_publishedAt_idx" ON "blog_articles" USING btree ("isPublished","publishedAt");--> statement-breakpoint
CREATE INDEX "blog_articles_slug_idx" ON "blog_articles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blog_articles_targetAudience_idx" ON "blog_articles" USING btree ("targetAudience");--> statement-breakpoint
CREATE UNIQUE INDEX "blog_bookmarks_articleId_userId_idx" ON "blog_bookmarks" USING btree ("articleId","userId");--> statement-breakpoint
CREATE INDEX "blog_bookmarks_articleId_idx" ON "blog_bookmarks" USING btree ("articleId");--> statement-breakpoint
CREATE INDEX "blog_bookmarks_userId_idx" ON "blog_bookmarks" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "blog_comments_articleId_createdAt_idx" ON "blog_comments" USING btree ("articleId","createdAt");--> statement-breakpoint
CREATE INDEX "blog_comments_userId_idx" ON "blog_comments" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "blog_likes_articleId_userId_idx" ON "blog_likes" USING btree ("articleId","userId");--> statement-breakpoint
CREATE INDEX "blog_likes_articleId_idx" ON "blog_likes" USING btree ("articleId");--> statement-breakpoint
CREATE INDEX "blog_likes_userId_idx" ON "blog_likes" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "certificates_userId_courseId_idx" ON "certificates" USING btree ("userId","courseId");--> statement-breakpoint
CREATE INDEX "certificates_courseId_idx" ON "certificates" USING btree ("courseId");--> statement-breakpoint
CREATE INDEX "certificates_issuedAt_idx" ON "certificates" USING btree ("issuedAt");--> statement-breakpoint
CREATE INDEX "comments_entityType_entityId_idx" ON "comments" USING btree ("entityType","entityId");--> statement-breakpoint
CREATE INDEX "comments_userId_idx" ON "comments" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "comments_createdAt_idx" ON "comments" USING btree ("createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "community_likes_postId_userId_idx" ON "community_likes" USING btree ("postId","userId");--> statement-breakpoint
CREATE INDEX "community_likes_userId_idx" ON "community_likes" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "community_posts_category_idx" ON "community_posts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "community_posts_createdAt_idx" ON "community_posts" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "community_posts_isPinned_createdAt_idx" ON "community_posts" USING btree ("isPinned","createdAt");--> statement-breakpoint
CREATE INDEX "community_posts_lastReplyAt_idx" ON "community_posts" USING btree ("lastReplyAt");--> statement-breakpoint
CREATE INDEX "community_posts_status_idx" ON "community_posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "community_posts_userId_idx" ON "community_posts" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "community_replies_postId_createdAt_idx" ON "community_replies" USING btree ("postId","createdAt");--> statement-breakpoint
CREATE INDEX "community_replies_userId_idx" ON "community_replies" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "community_reply_likes_replyId_userId_idx" ON "community_reply_likes" USING btree ("replyId","userId");--> statement-breakpoint
CREATE INDEX "community_reply_likes_userId_idx" ON "community_reply_likes" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "community_reports_entityType_entityId_idx" ON "community_reports" USING btree ("entityType","entityId");--> statement-breakpoint
CREATE INDEX "community_reports_reporterId_idx" ON "community_reports" USING btree ("reporterId");--> statement-breakpoint
CREATE INDEX "community_reports_status_idx" ON "community_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "community_reports_createdAt_idx" ON "community_reports" USING btree ("createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "course_progress_userId_courseId_idx" ON "course_progress" USING btree ("userId","courseId");--> statement-breakpoint
CREATE INDEX "course_progress_courseId_idx" ON "course_progress" USING btree ("courseId");--> statement-breakpoint
CREATE INDEX "courses_slug_idx" ON "courses" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "courses_instructorId_idx" ON "courses" USING btree ("instructorId");--> statement-breakpoint
CREATE INDEX "courses_category_idx" ON "courses" USING btree ("category");--> statement-breakpoint
CREATE INDEX "courses_level_idx" ON "courses" USING btree ("level");--> statement-breakpoint
CREATE INDEX "courses_isPublished_publishedAt_idx" ON "courses" USING btree ("isPublished","publishedAt");--> statement-breakpoint
CREATE INDEX "courses_isPublished_category_idx" ON "courses" USING btree ("isPublished","category");--> statement-breakpoint
CREATE INDEX "courses_createdAt_idx" ON "courses" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "courses_isFree_idx" ON "courses" USING btree ("isFree");--> statement-breakpoint
CREATE UNIQUE INDEX "enrollments_userId_courseId_idx" ON "enrollments" USING btree ("userId","courseId");--> statement-breakpoint
CREATE INDEX "enrollments_courseId_idx" ON "enrollments" USING btree ("courseId");--> statement-breakpoint
CREATE INDEX "enrollments_enrolledAt_idx" ON "enrollments" USING btree ("enrolledAt");--> statement-breakpoint
CREATE INDEX "enrollments_paymentStatus_idx" ON "enrollments" USING btree ("paymentStatus");--> statement-breakpoint
CREATE UNIQUE INDEX "event_registrations_eventId_userId_idx" ON "event_registrations" USING btree ("eventId","userId");--> statement-breakpoint
CREATE INDEX "event_registrations_eventId_idx" ON "event_registrations" USING btree ("eventId");--> statement-breakpoint
CREATE INDEX "event_registrations_userId_idx" ON "event_registrations" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "event_speakers_eventId_idx" ON "event_speakers" USING btree ("eventId");--> statement-breakpoint
CREATE INDEX "events_createdAt_idx" ON "events" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "events_eventDate_idx" ON "events" USING btree ("eventDate");--> statement-breakpoint
CREATE INDEX "events_isCancelled_idx" ON "events" USING btree ("isCancelled");--> statement-breakpoint
CREATE INDEX "events_isFree_idx" ON "events" USING btree ("isFree");--> statement-breakpoint
CREATE INDEX "events_isPublished_eventDate_idx" ON "events" USING btree ("isPublished","eventDate");--> statement-breakpoint
CREATE INDEX "events_slug_idx" ON "events" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_progress_userId_lessonId_idx" ON "lesson_progress" USING btree ("userId","lessonId");--> statement-breakpoint
CREATE INDEX "lesson_progress_lessonId_idx" ON "lesson_progress" USING btree ("lessonId");--> statement-breakpoint
CREATE INDEX "lesson_progress_isCompleted_idx" ON "lesson_progress" USING btree ("isCompleted");--> statement-breakpoint
CREATE UNIQUE INDEX "lessons_courseId_order_idx" ON "lessons" USING btree ("courseId","order");--> statement-breakpoint
CREATE INDEX "lessons_courseId_idx" ON "lessons" USING btree ("courseId");--> statement-breakpoint
CREATE INDEX "lessons_isPublished_idx" ON "lessons" USING btree ("isPublished");--> statement-breakpoint
CREATE INDEX "newsletter_campaigns_status_idx" ON "newsletter_campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "newsletter_campaigns_createdAt_idx" ON "newsletter_campaigns" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "newsletter_campaigns_scheduledAt_idx" ON "newsletter_campaigns" USING btree ("scheduledAt");--> statement-breakpoint
CREATE INDEX "newsletter_campaigns_createdById_idx" ON "newsletter_campaigns" USING btree ("createdById");--> statement-breakpoint
CREATE INDEX "newsletter_subscribers_email_idx" ON "newsletter_subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "newsletter_subscribers_status_idx" ON "newsletter_subscribers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "newsletter_subscribers_createdAt_idx" ON "newsletter_subscribers" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications" USING btree ("userId","isRead");--> statement-breakpoint
CREATE INDEX "product_partners_isActive_idx" ON "product_partners" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "product_partners_slug_idx" ON "product_partners" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_availability_idx" ON "products" USING btree ("availability");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category");--> statement-breakpoint
CREATE INDEX "products_createdAt_idx" ON "products" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "products_isActive_category_idx" ON "products" USING btree ("isActive","category");--> statement-breakpoint
CREATE INDEX "products_isActive_isFeatured_idx" ON "products" USING btree ("isActive","isFeatured");--> statement-breakpoint
CREATE INDEX "products_partnerId_idx" ON "products" USING btree ("partnerId");--> statement-breakpoint
CREATE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_userId_courseId_idx" ON "reviews" USING btree ("userId","courseId");--> statement-breakpoint
CREATE INDEX "reviews_courseId_idx" ON "reviews" USING btree ("courseId");--> statement-breakpoint
CREATE INDEX "reviews_isPublished_createdAt_idx" ON "reviews" USING btree ("isPublished","createdAt");--> statement-breakpoint
CREATE INDEX "reviews_rating_idx" ON "reviews" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "sessions_userId_idx" ON "sessions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "system_email_templates_code_idx" ON "system_email_templates" USING btree ("code");--> statement-breakpoint
CREATE INDEX "system_email_templates_category_idx" ON "system_email_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "system_email_templates_isActive_idx" ON "system_email_templates" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "users_createdAt_idx" ON "users" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "users_displayName_idx" ON "users" USING btree ("displayName");--> statement-breakpoint
CREATE INDEX "users_name_idx" ON "users" USING btree ("name");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");