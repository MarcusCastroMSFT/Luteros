-- AlterTable
ALTER TABLE "blog_articles" ADD COLUMN     "accessType" TEXT NOT NULL DEFAULT 'free',
ADD COLUMN     "targetAudience" TEXT NOT NULL DEFAULT 'general';
