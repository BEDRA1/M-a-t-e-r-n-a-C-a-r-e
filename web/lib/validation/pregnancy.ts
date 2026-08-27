import { z } from "zod";

export const lmpSchema = z.object({
  lmpDate: z.string().min(1, "تاريخ آخر دورة شهرية مطلوب"),
});

export const ovulationSchema = z.object({
  conceptionDate: z.string().min(1, "تاريخ الإباضة مطلوب"),
});

export const ultrasoundSchema = z.object({
  ultrasoundDate: z.string().min(1, "تاريخ السونار مطلوب"),
  ultrasoundWeeks: z
    .string()
    .min(1, "عدد أسابيع الحمل وقت السونار مطلوب")
    .refine((v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 1 && n <= 42;
    }, "عدد الأسابيع غير منطقي (1-42)"),
});
