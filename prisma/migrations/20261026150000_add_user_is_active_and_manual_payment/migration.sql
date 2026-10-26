-- تعطيل الحسابات بدل حذفها
ALTER TABLE "users" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;

-- منح الاشتراكات يدويًا من الإدارة
ALTER TYPE "SubscriptionPaymentMethod" ADD VALUE 'manual';
