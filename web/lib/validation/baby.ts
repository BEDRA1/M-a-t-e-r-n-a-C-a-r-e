import { z } from "zod";

export const babySchema = z.object({
  fullName: z.string().min(1, "اسم الطفل مطلوب").max(120, "الاسم طويل جدًا"),
  birthDate: z.string().min(1, "تاريخ الميلاد مطلوب"),
  gender: z.enum(["male", "female"], { message: "الجنس مطلوب" }),
  weightGrams: z
    .string()
    .optional()
    .refine((v) => !v || (Number(v) >= 200 && Number(v) <= 10000), "الوزن غير منطقي (200-10000 غرام)"),
  heightCm: z
    .string()
    .optional()
    .refine((v) => !v || (Number(v) >= 10 && Number(v) <= 100), "الطول غير منطقي (10-100 سم)"),
});

export type BabyFormValues = z.infer<typeof babySchema>;
