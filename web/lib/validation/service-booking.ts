import { z } from "zod";

export const serviceBookingSchema = z.object({
  scheduledTime: z.string().min(1, "موعد الخدمة مطلوب"),
  address: z.string().min(1, "العنوان مطلوب").max(300, "العنوان طويل جدًا"),
  notes: z.string().max(500, "الملاحظات طويلة جدًا").optional(),
});

export type ServiceBookingFormValues = z.infer<typeof serviceBookingSchema>;
