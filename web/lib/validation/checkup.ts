import { z } from "zod";

export const checkupSchema = z.object({
  title: z.string().min(1, "نوع الفحص مطلوب").max(150, "طويل جدًا"),
  scheduledDate: z.string().min(1, "موعد الفحص مطلوب"),
  notes: z.string().optional(),
});

export type CheckupFormValues = z.infer<typeof checkupSchema>;
