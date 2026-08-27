-- CreateEnum
CREATE TYPE "UrgentHelpTriggerSource" AS ENUM ('epds_critical_item', 'manual_button');

-- CreateEnum
CREATE TYPE "UrgentHelpStatus" AS ENUM ('open', 'contacted', 'closed');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AssessmentClassification" ADD VALUE 'minimal';
ALTER TYPE "AssessmentClassification" ADD VALUE 'mild';
ALTER TYPE "AssessmentClassification" ADD VALUE 'moderate';
ALTER TYPE "AssessmentClassification" ADD VALUE 'severe';
ALTER TYPE "AssessmentClassification" ADD VALUE 'needs_followup';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AssessmentDomainName" ADD VALUE 'gad7';
ALTER TYPE "AssessmentDomainName" ADD VALUE 'epds';

-- AlterTable
ALTER TABLE "assessment_domains" ADD COLUMN     "description_ar" TEXT,
ADD COLUMN     "instructions_ar" TEXT,
ADD COLUMN     "is_legacy" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "assessment_questions" ADD COLUMN     "is_critical" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "options_json" JSONB,
ADD COLUMN     "reverse_scored" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "urgent_help_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "trigger_source" "UrgentHelpTriggerSource" NOT NULL,
    "assessment_result_id" TEXT,
    "status" "UrgentHelpStatus" NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "urgent_help_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "urgent_help_requests_assessment_result_id_key" ON "urgent_help_requests"("assessment_result_id");

-- CreateIndex
CREATE INDEX "urgent_help_requests_user_id_idx" ON "urgent_help_requests"("user_id");

-- CreateIndex
CREATE INDEX "urgent_help_requests_status_idx" ON "urgent_help_requests"("status");

-- AddForeignKey
ALTER TABLE "urgent_help_requests" ADD CONSTRAINT "urgent_help_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "urgent_help_requests" ADD CONSTRAINT "urgent_help_requests_assessment_result_id_fkey" FOREIGN KEY ("assessment_result_id") REFERENCES "assessment_results"("id") ON DELETE SET NULL ON UPDATE CASCADE;
