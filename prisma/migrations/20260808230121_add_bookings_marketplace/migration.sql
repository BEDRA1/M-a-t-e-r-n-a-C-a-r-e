-- CreateEnum
CREATE TYPE "SpecialistStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "ConsultationType" AS ENUM ('in_person', 'remote');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('card', 'ccp', 'baridimob', 'pay_at_attendance');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'failed');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'specialist';

-- CreateTable
CREATE TABLE "specialists" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "years_experience" INTEGER NOT NULL,
    "photo_url" TEXT,
    "status" "SpecialistStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specialists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialist_availability" (
    "id" TEXT NOT NULL,
    "specialist_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "consultation_type" "ConsultationType" NOT NULL,
    "wilaya" TEXT,
    "is_booked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specialist_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation_reasons" (
    "id" TEXT NOT NULL,
    "reason_text" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "consultation_reasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "specialist_id" TEXT NOT NULL,
    "availability_slot_id" TEXT NOT NULL,
    "consultation_type" "ConsultationType" NOT NULL,
    "reason_id" TEXT NOT NULL,
    "questionnaire_answers" JSONB,
    "status" "BookingStatus" NOT NULL DEFAULT 'pending',
    "video_link" TEXT,
    "payment_method" "PaymentMethod",
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_reviews" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "specialists_user_id_key" ON "specialists"("user_id");

-- CreateIndex
CREATE INDEX "specialists_status_idx" ON "specialists"("status");

-- CreateIndex
CREATE INDEX "specialist_availability_specialist_id_is_booked_idx" ON "specialist_availability"("specialist_id", "is_booked");

-- CreateIndex
CREATE UNIQUE INDEX "specialist_availability_specialist_id_start_time_key" ON "specialist_availability"("specialist_id", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_availability_slot_id_key" ON "bookings"("availability_slot_id");

-- CreateIndex
CREATE INDEX "bookings_user_id_idx" ON "bookings"("user_id");

-- CreateIndex
CREATE INDEX "bookings_specialist_id_idx" ON "bookings"("specialist_id");

-- CreateIndex
CREATE UNIQUE INDEX "booking_reviews_booking_id_key" ON "booking_reviews"("booking_id");

-- AddForeignKey
ALTER TABLE "specialists" ADD CONSTRAINT "specialists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialist_availability" ADD CONSTRAINT "specialist_availability_specialist_id_fkey" FOREIGN KEY ("specialist_id") REFERENCES "specialists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_specialist_id_fkey" FOREIGN KEY ("specialist_id") REFERENCES "specialists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_availability_slot_id_fkey" FOREIGN KEY ("availability_slot_id") REFERENCES "specialist_availability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_reason_id_fkey" FOREIGN KEY ("reason_id") REFERENCES "consultation_reasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_reviews" ADD CONSTRAINT "booking_reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
