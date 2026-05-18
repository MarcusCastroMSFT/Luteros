import {
  pgTable,
  pgEnum,
  text,
  uuid,
  boolean,
  integer,
  timestamp,
  numeric,
  primaryKey,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import type { AdapterAccountType } from 'next-auth/adapters'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('UserRole', ['ADMIN', 'INSTRUCTOR', 'USER', 'PROFESSIONAL'])
export const lessonTypeEnum = pgEnum('LessonType', ['video', 'article', 'audio'])
export const communityPostStatusEnum = pgEnum('CommunityPostStatus', ['ACTIVE', 'CLOSED', 'MODERATION'])
export const newsletterStatusEnum = pgEnum('NewsletterStatus', ['PENDING', 'ACTIVE', 'UNSUBSCRIBED'])
export const campaignStatusEnum = pgEnum('CampaignStatus', ['DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED'])
export const systemEmailCategoryEnum = pgEnum('SystemEmailCategory', [
  'AUTHENTICATION', 'ACCOUNT', 'NOTIFICATION', 'TRANSACTION', 'ENGAGEMENT',
])
export const subscriptionStatusEnum = pgEnum('SubscriptionStatus', ['ACTIVE', 'INACTIVE', 'CANCELLED', 'TRIAL'])
export const subscriptionTierEnum = pgEnum('SubscriptionTier', ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'])
export const subscriptionAudienceEnum = pgEnum('SubscriptionAudience', ['general', 'doctors'])

// ─── NextAuth: users ──────────────────────────────────────────────────────────
// Merged with user_profiles - single table for auth + profile data

export const users = pgTable('users', {
  // NextAuth required fields
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),         // maps to fullName
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),       // maps to avatar/profile picture
  // Credentials auth (bcrypt hash)
  password: text('password'),
  // Role stored directly on user (replaces user_roles table)
  role: userRoleEnum('role').default('USER').notNull(),
  // Profile fields (from user_profiles)
  displayName: text('displayName'),
  bio: text('bio'),
  phone: text('phone'),
  dateOfBirth: timestamp('dateOfBirth', { mode: 'date' }),
  title: text('title'),
  company: text('company'),
  website: text('website'),
  linkedin: text('linkedin'),
  twitter: text('twitter'),
  instagram: text('instagram'),
  rating: numeric('rating', { precision: 3, scale: 2 }),
  reviewsCount: integer('reviewsCount').default(0).notNull(),
  studentsCount: integer('studentsCount').default(0).notNull(),
  coursesCount: integer('coursesCount').default(0).notNull(),
  language: text('language').default('en').notNull(),
  timezone: text('timezone').default('UTC').notNull(),
  emailNotifications: boolean('emailNotifications').default(true).notNull(),
  marketingEmails: boolean('marketingEmails').default(false).notNull(),
  lastLoginAt: timestamp('lastLoginAt', { mode: 'date' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [
  index('users_createdAt_idx').on(t.createdAt),
  index('users_displayName_idx').on(t.displayName),
  index('users_name_idx').on(t.name),
  index('users_role_idx').on(t.role),
])

// ─── NextAuth: accounts ───────────────────────────────────────────────────────

export const accounts = pgTable('accounts', {
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').$type<AdapterAccountType>().notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => [
  primaryKey({ columns: [account.provider, account.providerAccountId] }),
  index('accounts_userId_idx').on(account.userId),
])

// ─── NextAuth: sessions ───────────────────────────────────────────────────────

export const sessions = pgTable('sessions', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (t) => [
  index('sessions_userId_idx').on(t.userId),
])

// ─── NextAuth: verificationTokens ────────────────────────────────────────────

export const verificationTokens = pgTable('verificationTokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (vt) => [
  primaryKey({ columns: [vt.identifier, vt.token] }),
])

// ─── Blog Articles ────────────────────────────────────────────────────────────

export const blogArticles = pgTable('blog_articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  references: text('references'),
  image: text('image'),
  coverImage: text('coverImage'),
  authorId: text('authorId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  category: text('category').notNull(),
  tags: text('tags').array().notNull().default([]),
  metaTitle: text('metaTitle'),
  metaDescription: text('metaDescription'),
  readTime: integer('readTime').notNull(),
  viewCount: integer('viewCount').default(0).notNull(),
  commentCount: integer('commentCount').default(0).notNull(),
  likeCount: integer('likeCount').default(0).notNull(),
  isPublished: boolean('isPublished').default(false).notNull(),
  publishedAt: timestamp('publishedAt', { mode: 'date' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
  relatedArticleIds: uuid('relatedArticleIds').array().notNull().default([]),
  accessType: text('accessType').default('free').notNull(),
  targetAudience: text('targetAudience').default('general').notNull(),
}, (t) => [
  index('blog_articles_accessType_idx').on(t.accessType),
  index('blog_articles_authorId_idx').on(t.authorId),
  index('blog_articles_category_idx').on(t.category),
  index('blog_articles_createdAt_idx').on(t.createdAt),
  index('blog_articles_isPublished_category_idx').on(t.isPublished, t.category),
  index('blog_articles_isPublished_publishedAt_idx').on(t.isPublished, t.publishedAt),
  index('blog_articles_slug_idx').on(t.slug),
  index('blog_articles_targetAudience_idx').on(t.targetAudience),
])

// ─── Blog Comments ────────────────────────────────────────────────────────────

export const blogComments = pgTable('blog_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('articleId').notNull().references(() => blogArticles.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isPublished: boolean('isPublished').default(true).notNull(),
  isReported: boolean('isReported').default(false).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [
  index('blog_comments_articleId_createdAt_idx').on(t.articleId, t.createdAt),
  index('blog_comments_userId_idx').on(t.userId),
])

// ─── Blog Likes ───────────────────────────────────────────────────────────────

export const blogLikes = pgTable('blog_likes', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('articleId').notNull().references(() => blogArticles.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('blog_likes_articleId_userId_idx').on(t.articleId, t.userId),
  index('blog_likes_articleId_idx').on(t.articleId),
  index('blog_likes_userId_idx').on(t.userId),
])

// ─── Blog Bookmarks ───────────────────────────────────────────────────────────

export const blogBookmarks = pgTable('blog_bookmarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('articleId').notNull().references(() => blogArticles.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('blog_bookmarks_articleId_userId_idx').on(t.articleId, t.userId),
  index('blog_bookmarks_articleId_idx').on(t.articleId),
  index('blog_bookmarks_userId_idx').on(t.userId),
])

// ─── Certificates ─────────────────────────────────────────────────────────────

export const certificates = pgTable('certificates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('courseId').notNull(),
  certificateNumber: text('certificateNumber').notNull().unique(),
  issuedAt: timestamp('issuedAt', { mode: 'date' }).defaultNow().notNull(),
  expiresAt: timestamp('expiresAt', { mode: 'date' }),
  verificationUrl: text('verificationUrl'),
}, (t) => [
  uniqueIndex('certificates_userId_courseId_idx').on(t.userId, t.courseId),
  index('certificates_courseId_idx').on(t.courseId),
  index('certificates_issuedAt_idx').on(t.issuedAt),
])

// ─── Comments ─────────────────────────────────────────────────────────────────

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  entityType: text('entityType').notNull(),
  entityId: uuid('entityId').notNull(),
  content: text('content').notNull(),
  isPublished: boolean('isPublished').default(true).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [
  index('comments_entityType_entityId_idx').on(t.entityType, t.entityId),
  index('comments_userId_idx').on(t.userId),
  index('comments_createdAt_idx').on(t.createdAt),
])

// ─── Community Posts ──────────────────────────────────────────────────────────

export const communityPosts = pgTable('community_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  category: text('category').notNull(),
  subcategory: text('subcategory'),
  tags: text('tags').array().notNull().default([]),
  isAnonymous: boolean('isAnonymous').default(false).notNull(),
  status: communityPostStatusEnum('status').default('ACTIVE').notNull(),
  isReported: boolean('isReported').default(false).notNull(),
  isPinned: boolean('isPinned').default(false).notNull(),
  viewCount: integer('viewCount').default(0).notNull(),
  replyCount: integer('replyCount').default(0).notNull(),
  likeCount: integer('likeCount').default(0).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
  lastReplyAt: timestamp('lastReplyAt', { mode: 'date' }),
}, (t) => [
  index('community_posts_category_idx').on(t.category),
  index('community_posts_createdAt_idx').on(t.createdAt),
  index('community_posts_isPinned_createdAt_idx').on(t.isPinned, t.createdAt),
  index('community_posts_lastReplyAt_idx').on(t.lastReplyAt),
  index('community_posts_status_idx').on(t.status),
  index('community_posts_userId_idx').on(t.userId),
])

// ─── Community Replies ────────────────────────────────────────────────────────

export const communityReplies = pgTable('community_replies', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('postId').notNull().references(() => communityPosts.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isAnonymous: boolean('isAnonymous').default(false).notNull(),
  isReported: boolean('isReported').default(false).notNull(),
  likeCount: integer('likeCount').default(0).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [
  index('community_replies_postId_createdAt_idx').on(t.postId, t.createdAt),
  index('community_replies_userId_idx').on(t.userId),
])

// ─── Community Likes ──────────────────────────────────────────────────────────

export const communityLikes = pgTable('community_likes', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('postId').notNull().references(() => communityPosts.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('community_likes_postId_userId_idx').on(t.postId, t.userId),
  index('community_likes_userId_idx').on(t.userId),
])

// ─── Community Reply Likes ────────────────────────────────────────────────────

export const communityReplyLikes = pgTable('community_reply_likes', {
  id: uuid('id').primaryKey().defaultRandom(),
  replyId: uuid('replyId').notNull().references(() => communityReplies.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('community_reply_likes_replyId_userId_idx').on(t.replyId, t.userId),
  index('community_reply_likes_userId_idx').on(t.userId),
])

// ─── Community Reports ────────────────────────────────────────────────────────

export const communityReports = pgTable('community_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityType: text('entityType').notNull(), // 'post' or 'reply'
  entityId: uuid('entityId').notNull(),
  reporterId: text('reporterId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reason: text('reason').notNull(),
  details: text('details'),
  status: text('status').default('PENDING').notNull(), // PENDING, REVIEWED, RESOLVED, DISMISSED
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [
  index('community_reports_entityType_entityId_idx').on(t.entityType, t.entityId),
  index('community_reports_reporterId_idx').on(t.reporterId),
  index('community_reports_status_idx').on(t.status),
  index('community_reports_createdAt_idx').on(t.createdAt),
])

// ─── Courses ──────────────────────────────────────────────────────────────────

export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  shortDescription: text('shortDescription'),
  level: text('level').notNull(),
  category: text('category').notNull(),
  language: text('language').default('en').notNull(),
  duration: integer('duration'),
  thumbnail: text('thumbnail'),
  coverImage: text('coverImage'),
  previewVideo: text('previewVideo'),
  instructorId: text('instructorId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  price: numeric('price', { precision: 10, scale: 2 }),
  discountPrice: numeric('discountPrice', { precision: 10, scale: 2 }),
  isFree: boolean('isFree').default(false).notNull(),
  isPublished: boolean('isPublished').default(false).notNull(),
  publishedAt: timestamp('publishedAt', { mode: 'date' }),
  enrollmentCount: integer('enrollmentCount').default(0).notNull(),
  averageRating: numeric('averageRating', { precision: 3, scale: 2 }),
  reviewCount: integer('reviewCount').default(0).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [
  index('courses_slug_idx').on(t.slug),
  index('courses_instructorId_idx').on(t.instructorId),
  index('courses_category_idx').on(t.category),
  index('courses_level_idx').on(t.level),
  index('courses_isPublished_publishedAt_idx').on(t.isPublished, t.publishedAt),
  index('courses_isPublished_category_idx').on(t.isPublished, t.category),
  index('courses_createdAt_idx').on(t.createdAt),
  index('courses_isFree_idx').on(t.isFree),
])

// ─── Lessons ──────────────────────────────────────────────────────────────────

export const lessons = pgTable('lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('courseId').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  content: text('content'),
  videoUrl: text('videoUrl'),
  duration: integer('duration'),
  order: integer('order').notNull(),
  sectionTitle: text('sectionTitle'),
  isPublished: boolean('isPublished').default(false).notNull(),
  isFree: boolean('isFree').default(false).notNull(),
  type: lessonTypeEnum('type').default('video').notNull(),
  videoProvider: text('videoProvider'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('lessons_courseId_order_idx').on(t.courseId, t.order),
  index('lessons_courseId_idx').on(t.courseId),
  index('lessons_isPublished_idx').on(t.isPublished),
])

// ─── Course Progress ──────────────────────────────────────────────────────────

export const courseProgress = pgTable('course_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('courseId').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  completedLessons: integer('completedLessons').default(0).notNull(),
  totalLessons: integer('totalLessons').notNull(),
  progressPercent: integer('progressPercent').default(0).notNull(),
  lastAccessedAt: timestamp('lastAccessedAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('course_progress_userId_courseId_idx').on(t.userId, t.courseId),
  index('course_progress_courseId_idx').on(t.courseId),
])

// ─── Lesson Progress ──────────────────────────────────────────────────────────

export const lessonProgress = pgTable('lesson_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lessonId: uuid('lessonId').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  isCompleted: boolean('isCompleted').default(false).notNull(),
  completedAt: timestamp('completedAt', { mode: 'date' }),
  watchedDuration: integer('watchedDuration').default(0).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('lesson_progress_userId_lessonId_idx').on(t.userId, t.lessonId),
  index('lesson_progress_lessonId_idx').on(t.lessonId),
  index('lesson_progress_isCompleted_idx').on(t.isCompleted),
])

// ─── Enrollments ──────────────────────────────────────────────────────────────

export const enrollments = pgTable('enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('courseId').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  enrolledAt: timestamp('enrolledAt', { mode: 'date' }).defaultNow().notNull(),
  completedAt: timestamp('completedAt', { mode: 'date' }),
  expiresAt: timestamp('expiresAt', { mode: 'date' }),
  progressPercent: integer('progressPercent').default(0).notNull(),
  paidAmount: numeric('paidAmount', { precision: 10, scale: 2 }),
  paymentStatus: text('paymentStatus'),
}, (t) => [
  uniqueIndex('enrollments_userId_courseId_idx').on(t.userId, t.courseId),
  index('enrollments_courseId_idx').on(t.courseId),
  index('enrollments_enrolledAt_idx').on(t.enrolledAt),
  index('enrollments_paymentStatus_idx').on(t.paymentStatus),
])

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('courseId').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  title: text('title'),
  comment: text('comment'),
  isPublished: boolean('isPublished').default(true).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('reviews_userId_courseId_idx').on(t.userId, t.courseId),
  index('reviews_courseId_idx').on(t.courseId),
  index('reviews_isPublished_createdAt_idx').on(t.isPublished, t.createdAt),
  index('reviews_rating_idx').on(t.rating),
])

// ─── Events ───────────────────────────────────────────────────────────────────

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  fullDescription: text('fullDescription'),
  location: text('location').notNull(),
  eventDate: timestamp('eventDate', { mode: 'date' }).notNull(),
  eventTime: text('eventTime').notNull(),
  duration: integer('duration'),
  image: text('image'),
  totalSlots: integer('totalSlots').notNull(),
  cost: numeric('cost', { precision: 10, scale: 2 }),
  isFree: boolean('isFree').default(false).notNull(),
  isPublished: boolean('isPublished').default(false).notNull(),
  isCancelled: boolean('isCancelled').default(false).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [
  index('events_createdAt_idx').on(t.createdAt),
  index('events_eventDate_idx').on(t.eventDate),
  index('events_isCancelled_idx').on(t.isCancelled),
  index('events_isFree_idx').on(t.isFree),
  index('events_isPublished_eventDate_idx').on(t.isPublished, t.eventDate),
  index('events_slug_idx').on(t.slug),
])

// ─── Event Speakers ───────────────────────────────────────────────────────────

export const eventSpeakers = pgTable('event_speakers', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('eventId').notNull().references(() => events.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  title: text('title'),
  bio: text('bio'),
  image: text('image'),
  linkedin: text('linkedin'),
  twitter: text('twitter'),
  website: text('website'),
  order: integer('order').default(0).notNull(),
}, (t) => [
  index('event_speakers_eventId_idx').on(t.eventId),
])

// ─── Event Registrations ──────────────────────────────────────────────────────

export const eventRegistrations = pgTable('event_registrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('eventId').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  registeredAt: timestamp('registeredAt', { mode: 'date' }).defaultNow().notNull(),
  attended: boolean('attended').default(false).notNull(),
  paidAmount: numeric('paidAmount', { precision: 10, scale: 2 }),
  paymentStatus: text('paymentStatus'),
}, (t) => [
  uniqueIndex('event_registrations_eventId_userId_idx').on(t.eventId, t.userId),
  index('event_registrations_eventId_idx').on(t.eventId),
  index('event_registrations_userId_idx').on(t.userId),
])

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  actionUrl: text('actionUrl'),
  isRead: boolean('isRead').default(false).notNull(),
  readAt: timestamp('readAt', { mode: 'date' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [
  index('notifications_userId_isRead_idx').on(t.userId, t.isRead),
])

// ─── Product Partners ─────────────────────────────────────────────────────────

export const productPartners = pgTable('product_partners', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logo: text('logo'),
  website: text('website'),
  description: text('description'),
  email: text('email'),
  phone: text('phone'),
  isActive: boolean('isActive').default(true).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [
  index('product_partners_isActive_idx').on(t.isActive),
  index('product_partners_slug_idx').on(t.slug),
])

// ─── Products ─────────────────────────────────────────────────────────────────

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  shortDescription: text('shortDescription').notNull(),
  image: text('image'),
  partnerId: uuid('partnerId').notNull().references(() => productPartners.id, { onDelete: 'cascade' }),
  discountPercentage: integer('discountPercentage').default(0).notNull(),
  discountType: text('discountType').default('percentage').notNull(),
  originalPrice: numeric('originalPrice', { precision: 10, scale: 2 }),
  discountedPrice: numeric('discountedPrice', { precision: 10, scale: 2 }),
  discountAmount: numeric('discountAmount', { precision: 10, scale: 2 }),
  promoCode: text('promoCode').notNull(),
  category: text('category').notNull(),
  tags: text('tags').array().notNull().default([]),
  availability: text('availability').default('all').notNull(),
  validUntil: timestamp('validUntil', { mode: 'date' }),
  termsAndConditions: text('termsAndConditions'),
  howToUse: text('howToUse').array().notNull().default([]),
  features: text('features').array().notNull().default([]),
  isActive: boolean('isActive').default(true).notNull(),
  isFeatured: boolean('isFeatured').default(false).notNull(),
  usageCount: integer('usageCount').default(0).notNull(),
  maxUsages: integer('maxUsages'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [
  index('products_availability_idx').on(t.availability),
  index('products_category_idx').on(t.category),
  index('products_createdAt_idx').on(t.createdAt),
  index('products_isActive_category_idx').on(t.isActive, t.category),
  index('products_isActive_isFeatured_idx').on(t.isActive, t.isFeatured),
  index('products_partnerId_idx').on(t.partnerId),
  index('products_slug_idx').on(t.slug),
])

// ─── Newsletter Subscribers ───────────────────────────────────────────────────

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  status: newsletterStatusEnum('status').default('ACTIVE').notNull(),
  unsubscribeToken: uuid('unsubscribeToken').notNull().unique().defaultRandom(),
  source: text('source'),
  ipAddress: text('ipAddress'),
  confirmedAt: timestamp('confirmedAt', { mode: 'date' }),
  unsubscribedAt: timestamp('unsubscribedAt', { mode: 'date' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [
  index('newsletter_subscribers_email_idx').on(t.email),
  index('newsletter_subscribers_status_idx').on(t.status),
  index('newsletter_subscribers_createdAt_idx').on(t.createdAt),
])

// ─── Newsletter Campaigns ─────────────────────────────────────────────────────

export const newsletterCampaigns = pgTable('newsletter_campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  subject: text('subject').notNull(),
  previewText: text('previewText'),
  content: text('content').notNull(),
  ctaText: text('ctaText'),
  ctaUrl: text('ctaUrl'),
  status: campaignStatusEnum('status').default('DRAFT').notNull(),
  errorMessage: text('errorMessage'),
  scheduledAt: timestamp('scheduledAt', { mode: 'date' }),
  sentAt: timestamp('sentAt', { mode: 'date' }),
  totalRecipients: integer('totalRecipients').default(0).notNull(),
  sentCount: integer('sentCount').default(0).notNull(),
  failedCount: integer('failedCount').default(0).notNull(),
  createdById: text('createdById').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [
  index('newsletter_campaigns_status_idx').on(t.status),
  index('newsletter_campaigns_createdAt_idx').on(t.createdAt),
  index('newsletter_campaigns_scheduledAt_idx').on(t.scheduledAt),
  index('newsletter_campaigns_createdById_idx').on(t.createdById),
])

// ─── System Email Templates ───────────────────────────────────────────────────

export const systemEmailTemplates = pgTable('system_email_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  category: systemEmailCategoryEnum('category').notNull(),
  subject: text('subject').notNull(),
  previewText: text('previewText'),
  htmlContent: text('htmlContent').notNull(),
  textContent: text('textContent'),
  variables: text('variables').array().notNull().default([]),
  isActive: boolean('isActive').default(true).notNull(),
  updatedById: text('updatedById').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [
  index('system_email_templates_code_idx').on(t.code),
  index('system_email_templates_category_idx').on(t.category),
  index('system_email_templates_isActive_idx').on(t.isActive),
])

// ─── Subscription plans & user subscriptions ─────────────────────────────────

export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  audience: subscriptionAudienceEnum('audience').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('BRL').notNull(),
  billingPeriod: text('billingPeriod').notNull(), // 'monthly' | 'yearly' | 'lifetime'
  isActive: boolean('isActive').default(true).notNull(),
  sortOrder: integer('sortOrder').default(0).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('subscription_plans_code_unique').on(t.code),
  index('subscription_plans_audience_idx').on(t.audience),
  index('subscription_plans_isActive_idx').on(t.isActive),
])

export const userSubscriptions = pgTable('user_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  planId: uuid('planId').notNull().references(() => subscriptionPlans.id, { onDelete: 'restrict' }),
  status: subscriptionStatusEnum('status').default('ACTIVE').notNull(),
  startsAt: timestamp('startsAt', { mode: 'date' }).defaultNow().notNull(),
  endsAt: timestamp('endsAt', { mode: 'date' }),
  cancelledAt: timestamp('cancelledAt', { mode: 'date' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (t) => [
  index('user_subscriptions_userId_idx').on(t.userId),
  index('user_subscriptions_active_idx').on(t.userId, t.status, t.endsAt),
])

// ─── Type exports ─────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type BlogArticle = typeof blogArticles.$inferSelect
export type Course = typeof courses.$inferSelect
export type Event = typeof events.$inferSelect
export type CommunityPost = typeof communityPosts.$inferSelect
export type CommunityReply = typeof communityReplies.$inferSelect
export type Enrollment = typeof enrollments.$inferSelect
export type EventRegistration = typeof eventRegistrations.$inferSelect
export type NewsletterCampaign = typeof newsletterCampaigns.$inferSelect
export type SystemEmailTemplate = typeof systemEmailTemplates.$inferSelect
export type UserRole = typeof userRoleEnum.enumValues[number]
