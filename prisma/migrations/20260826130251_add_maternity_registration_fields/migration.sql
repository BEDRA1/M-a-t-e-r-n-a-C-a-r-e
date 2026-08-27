-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('natural', 'cesarean');

-- AlterTable
ALTER TABLE "postpartum_periods" ADD COLUMN     "delivery_type" "DeliveryType",
ADD COLUMN     "has_complications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_health_condition" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "health_condition_note" TEXT,
ADD COLUMN     "is_breastfeeding" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "pregnancies" ADD COLUMN     "has_health_condition" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "health_condition_note" TEXT,
ADD COLUMN     "is_first_pregnancy" BOOLEAN,
ADD COLUMN     "previous_pregnancies_count" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "date_of_birth" TIMESTAMP(3);
