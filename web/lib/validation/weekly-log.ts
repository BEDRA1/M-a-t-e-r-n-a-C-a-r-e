import { z } from "zod";

export const weeklyLogSchema = z.object({
  weekNumber: z
    .string()
    .min(1, "رقم الأسبوع مطلوب")
    .refine((v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 1 && n <= 42;
    }, "رقم الأسبوع غير منطقي (1-42)"),
  weightKg: z
    .string()
    .optional()
    .refine((v) => !v || (Number(v) >= 20 && Number(v) <= 300), "الوزن غير منطقي"),
  symptoms: z.string().optional(),
  notes: z.string().optional(),
});

export type WeeklyLogFormValues = z.infer<typeof weeklyLogSchema>;
