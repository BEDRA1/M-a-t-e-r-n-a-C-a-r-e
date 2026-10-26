-- يميّز "مرفوض" عن "بانتظار المراجعة": كلاهما isApproved=false، والفرق أن الأول رُوجِع
ALTER TABLE "testimonials" ADD COLUMN "reviewed_at" TIMESTAMP(3);
