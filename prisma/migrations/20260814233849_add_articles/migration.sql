-- CreateEnum
CREATE TYPE "ArticleCategory" AS ENUM ('pregnancy', 'birth', 'postpartum', 'baby_health', 'nutrition', 'mental_health');

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt_ar" TEXT NOT NULL,
    "content_ar" TEXT NOT NULL,
    "cover_image_url" TEXT NOT NULL,
    "category" "ArticleCategory" NOT NULL,
    "author_name" TEXT NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "read_time_minutes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "articles_category_idx" ON "articles"("category");

-- CreateIndex
CREATE INDEX "articles_is_published_published_at_idx" ON "articles"("is_published", "published_at");
