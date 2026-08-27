-- CreateEnum
CREATE TYPE "SpecialistTrack" AS ENUM ('psychological', 'health', 'nutrition');

-- CreateEnum
CREATE TYPE "ServiceKind" AS ENUM ('consultation', 'course');

-- AlterTable
ALTER TABLE "specialists" ADD COLUMN     "track" "SpecialistTrack" NOT NULL DEFAULT 'psychological';

-- CreateTable
CREATE TABLE "service_pricing" (
    "id" TEXT NOT NULL,
    "service_kind" "ServiceKind" NOT NULL,
    "consultation_type" "ConsultationType" NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "service_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_pricing_service_kind_consultation_type_key" ON "service_pricing"("service_kind", "consultation_type");

-- CreateIndex
CREATE INDEX "specialists_track_idx" ON "specialists"("track");
