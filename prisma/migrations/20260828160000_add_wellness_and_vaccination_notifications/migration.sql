-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'vaccination_reminder';
ALTER TYPE "NotificationType" ADD VALUE 'daily_tip';

-- CreateTable
CREATE TABLE "wellness_tips" (
    "id" TEXT NOT NULL,
    "tip_number" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "tip_text_ar" TEXT NOT NULL,

    CONSTRAINT "wellness_tips_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wellness_tips_tip_number_key" ON "wellness_tips"("tip_number");
