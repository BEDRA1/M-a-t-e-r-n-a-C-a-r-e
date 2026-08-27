-- AlterTable
-- الجدول قد يحتوي صفوفًا موجودة، لذا نضيف العمود بدون قيد NOT NULL أولًا،
-- نملأ قيمة مؤقتة للصفوف الموجودة (يُستبدَل لاحقًا ببيانات حقيقية عبر seed أو تحديث الأخصائي
-- لملفه)، ثم نفرض القيد NOT NULL.
ALTER TABLE "specialists" ADD COLUMN "full_name" TEXT;

UPDATE "specialists" SET "full_name" = 'أخصائي/ة معتمد' WHERE "full_name" IS NULL;

ALTER TABLE "specialists" ALTER COLUMN "full_name" SET NOT NULL;
