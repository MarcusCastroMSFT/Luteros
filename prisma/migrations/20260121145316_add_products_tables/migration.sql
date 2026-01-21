-- CreateTable
CREATE TABLE "product_partners" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "website" TEXT,
    "description" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "image" TEXT,
    "partnerId" UUID NOT NULL,
    "discountPercentage" INTEGER NOT NULL DEFAULT 0,
    "discountType" TEXT NOT NULL DEFAULT 'percentage',
    "originalPrice" DECIMAL(10,2),
    "discountedPrice" DECIMAL(10,2),
    "discountAmount" DECIMAL(10,2),
    "promoCode" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "availability" TEXT NOT NULL DEFAULT 'all',
    "validUntil" TIMESTAMP(3),
    "termsAndConditions" TEXT,
    "howToUse" TEXT[],
    "features" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "maxUsages" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_partners_slug_key" ON "product_partners"("slug");

-- CreateIndex
CREATE INDEX "product_partners_slug_idx" ON "product_partners"("slug");

-- CreateIndex
CREATE INDEX "product_partners_isActive_idx" ON "product_partners"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_slug_idx" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_partnerId_idx" ON "products"("partnerId");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_isActive_isFeatured_idx" ON "products"("isActive", "isFeatured");

-- CreateIndex
CREATE INDEX "products_isActive_category_idx" ON "products"("isActive", "category");

-- CreateIndex
CREATE INDEX "products_availability_idx" ON "products"("availability");

-- CreateIndex
CREATE INDEX "products_createdAt_idx" ON "products"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "product_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
