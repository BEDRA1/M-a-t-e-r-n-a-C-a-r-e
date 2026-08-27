-- CreateEnum
CREATE TYPE "BabyGender" AS ENUM ('male', 'female');

-- CreateTable
CREATE TABLE "postpartum_periods" (
    "id" TEXT NOT NULL,
    "mother_id" TEXT NOT NULL,
    "pregnancy_id" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "postpartum_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postpartum_mood_logs" (
    "id" TEXT NOT NULL,
    "postpartum_period_id" TEXT NOT NULL,
    "mood_level" INTEGER NOT NULL,
    "notes" TEXT,
    "logged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "postpartum_mood_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "babies" (
    "id" TEXT NOT NULL,
    "family_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "gender" "BabyGender" NOT NULL,
    "weight_grams" INTEGER,
    "height_cm" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "babies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "baby_checkups" (
    "id" TEXT NOT NULL,
    "baby_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "linked_reminder_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "baby_checkups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "postpartum_periods_pregnancy_id_key" ON "postpartum_periods"("pregnancy_id");

-- CreateIndex
CREATE INDEX "postpartum_periods_mother_id_idx" ON "postpartum_periods"("mother_id");

-- CreateIndex
CREATE INDEX "postpartum_mood_logs_postpartum_period_id_logged_at_idx" ON "postpartum_mood_logs"("postpartum_period_id", "logged_at");

-- CreateIndex
CREATE INDEX "babies_family_id_idx" ON "babies"("family_id");

-- CreateIndex
CREATE INDEX "baby_checkups_baby_id_idx" ON "baby_checkups"("baby_id");

-- AddForeignKey
ALTER TABLE "postpartum_periods" ADD CONSTRAINT "postpartum_periods_mother_id_fkey" FOREIGN KEY ("mother_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postpartum_periods" ADD CONSTRAINT "postpartum_periods_pregnancy_id_fkey" FOREIGN KEY ("pregnancy_id") REFERENCES "pregnancies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postpartum_mood_logs" ADD CONSTRAINT "postpartum_mood_logs_postpartum_period_id_fkey" FOREIGN KEY ("postpartum_period_id") REFERENCES "postpartum_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "babies" ADD CONSTRAINT "babies_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "baby_checkups" ADD CONSTRAINT "baby_checkups_baby_id_fkey" FOREIGN KEY ("baby_id") REFERENCES "babies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
