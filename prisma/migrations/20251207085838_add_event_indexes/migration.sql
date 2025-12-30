-- CreateIndex
CREATE INDEX "events_isFree_idx" ON "events"("isFree");

-- CreateIndex
CREATE INDEX "events_isCancelled_idx" ON "events"("isCancelled");

-- CreateIndex
CREATE INDEX "events_createdAt_idx" ON "events"("createdAt" DESC);
