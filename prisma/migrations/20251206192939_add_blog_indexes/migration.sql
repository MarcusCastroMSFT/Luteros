-- CreateIndex
CREATE INDEX "blog_articles_isPublished_category_idx" ON "blog_articles"("isPublished", "category");

-- CreateIndex
CREATE INDEX "blog_articles_accessType_idx" ON "blog_articles"("accessType");

-- CreateIndex
CREATE INDEX "blog_articles_targetAudience_idx" ON "blog_articles"("targetAudience");
