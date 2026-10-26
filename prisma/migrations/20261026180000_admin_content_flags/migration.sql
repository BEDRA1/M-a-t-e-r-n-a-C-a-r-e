ALTER TABLE "weekly_meals" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "products" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "daily_tips" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "courses" ADD COLUMN "image_url" TEXT;
ALTER TABLE "bookings" ADD COLUMN "price" INTEGER;
ALTER TYPE "NotificationType" ADD VALUE 'broadcast';

-- الحجوزات القائمة تأخذ سعر الاستشارة الحالي قبل أن يصبح قابلًا للتعديل
UPDATE "bookings" b
SET "price" = sp."price"
FROM "service_pricing" sp
WHERE sp."service_kind" = 'consultation' AND sp."consultation_type" = b."consultation_type";
