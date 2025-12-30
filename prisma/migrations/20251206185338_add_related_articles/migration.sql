-- AlterTable
ALTER TABLE "blog_articles" ADD COLUMN     "relatedArticleIds" UUID[] DEFAULT ARRAY[]::UUID[];
