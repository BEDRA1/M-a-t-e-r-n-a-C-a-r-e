-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('mother', 'spouse', 'admin');

-- CreateEnum
CREATE TYPE "PregnancyCalcMethod" AS ENUM ('lmp', 'ovulation', 'ultrasound');

-- CreateEnum
CREATE TYPE "PregnancyStatus" AS ENUM ('active', 'completed', 'ended');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('vitamin', 'medication', 'water', 'appointment', 'other');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "wilaya" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "families" (
    "id" TEXT NOT NULL,
    "mother_user_id" TEXT NOT NULL,
    "spouse_user_id" TEXT,
    "invite_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pregnancies" (
    "id" TEXT NOT NULL,
    "mother_id" TEXT NOT NULL,
    "calc_method" "PregnancyCalcMethod" NOT NULL,
    "lmp_date" TIMESTAMP(3),
    "conception_date" TIMESTAMP(3),
    "ultrasound_date" TIMESTAMP(3),
    "ultrasound_weeks" INTEGER,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" "PregnancyStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pregnancies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pregnancy_weekly_logs" (
    "id" TEXT NOT NULL,
    "pregnancy_id" TEXT NOT NULL,
    "week_number" INTEGER NOT NULL,
    "weight_kg" DECIMAL(5,2),
    "symptoms" JSONB,
    "notes" TEXT,
    "logged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pregnancy_weekly_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pregnancy_week_content" (
    "id" TEXT NOT NULL,
    "week_number" INTEGER NOT NULL,
    "baby_size_comparison" TEXT NOT NULL,
    "baby_weight_grams" INTEGER,
    "baby_length_cm" DECIMAL(5,2),
    "body_changes_text" TEXT NOT NULL,
    "tips_json" JSONB NOT NULL,
    "development_json" JSONB NOT NULL,

    CONSTRAINT "pregnancy_week_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "ReminderType" NOT NULL,
    "title" TEXT NOT NULL,
    "scheduled_time" TIMESTAMP(3) NOT NULL,
    "recurrence" TEXT,
    "is_done" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "families_mother_user_id_key" ON "families"("mother_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "families_spouse_user_id_key" ON "families"("spouse_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "families_invite_code_key" ON "families"("invite_code");

-- CreateIndex
CREATE INDEX "pregnancies_mother_id_idx" ON "pregnancies"("mother_id");

-- CreateIndex
CREATE INDEX "pregnancy_weekly_logs_pregnancy_id_idx" ON "pregnancy_weekly_logs"("pregnancy_id");

-- CreateIndex
CREATE UNIQUE INDEX "pregnancy_week_content_week_number_key" ON "pregnancy_week_content"("week_number");

-- CreateIndex
CREATE INDEX "reminders_user_id_idx" ON "reminders"("user_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "families" ADD CONSTRAINT "families_mother_user_id_fkey" FOREIGN KEY ("mother_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "families" ADD CONSTRAINT "families_spouse_user_id_fkey" FOREIGN KEY ("spouse_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pregnancies" ADD CONSTRAINT "pregnancies_mother_id_fkey" FOREIGN KEY ("mother_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pregnancy_weekly_logs" ADD CONSTRAINT "pregnancy_weekly_logs_pregnancy_id_fkey" FOREIGN KEY ("pregnancy_id") REFERENCES "pregnancies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
