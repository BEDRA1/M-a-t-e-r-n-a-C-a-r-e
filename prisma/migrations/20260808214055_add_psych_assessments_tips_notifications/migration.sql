-- CreateEnum
CREATE TYPE "AssessmentDomainName" AS ENUM ('anxiety', 'depression', 'stress', 'pressure', 'sleep');

-- CreateEnum
CREATE TYPE "AssessmentClassification" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('booking_confirmed', 'appointment_reminder', 'general');

-- CreateTable
CREATE TABLE "assessment_domains" (
    "id" TEXT NOT NULL,
    "name" "AssessmentDomainName" NOT NULL,
    "name_ar" TEXT NOT NULL,

    CONSTRAINT "assessment_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_questions" (
    "id" TEXT NOT NULL,
    "domain_id" TEXT NOT NULL,
    "question_text_ar" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "assessment_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_results" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "domain_id" TEXT NOT NULL,
    "total_score" INTEGER NOT NULL,
    "classification" "AssessmentClassification" NOT NULL,
    "answers" JSONB NOT NULL,
    "taken_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_tips" (
    "id" TEXT NOT NULL,
    "tip_number" INTEGER NOT NULL,
    "tip_text_ar" TEXT NOT NULL,

    CONSTRAINT "daily_tips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "source_reminder_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assessment_domains_name_key" ON "assessment_domains"("name");

-- CreateIndex
CREATE INDEX "assessment_questions_domain_id_idx" ON "assessment_questions"("domain_id");

-- CreateIndex
CREATE INDEX "assessment_results_user_id_idx" ON "assessment_results"("user_id");

-- CreateIndex
CREATE INDEX "assessment_results_domain_id_idx" ON "assessment_results"("domain_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_tips_tip_number_key" ON "daily_tips"("tip_number");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_source_reminder_id_idx" ON "notifications"("source_reminder_id");

-- AddForeignKey
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "assessment_domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "assessment_domains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
