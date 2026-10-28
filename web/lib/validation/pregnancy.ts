import { z } from "zod";

// هامش يوم: "YYYY-MM-DD" يُقرأ منتصف ليل UTC
const notFuture = (v: string) => new Date(v).getTime() <= Date.now() + 86_400_000;

export const lmpSchema = z.object({
  lmpDate: z.string().min(1, "تاريخ آخر دورة شهرية مطلوب").refine(notFuture, "التاريخ لا يمكن أن يكون في المستقبل"),
});

export const ovulationSchema = z.object({
  conceptionDate: z.string().min(1, "تاريخ الإباضة مطلوب").refine(notFuture, "التاريخ لا يمكن أن يكون في المستقبل"),
});

export const ultrasoundSchema = z.object({
  ultrasoundDate: z.string().min(1, "تاريخ السونار مطلوب").refine(notFuture, "التاريخ لا يمكن أن يكون في المستقبل"),
  ultrasoundWeeks: z
    .string()
    .min(1, "عدد أسابيع الحمل وقت السونار مطلوب")
    .refine((v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 1 && n <= 42;
    }, "عدد الأسابيع غير منطقي (1-42)"),
});
