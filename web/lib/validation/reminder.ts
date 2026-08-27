import { z } from "zod";

export const reminderSchema = z.object({
  type: z.enum(["vitamin", "medication", "water", "appointment", "other"], {
    message: "نوع التذكير مطلوب",
  }),
  title: z.string().min(1, "عنوان التذكير مطلوب").max(120, "العنوان طويل جدًا"),
  scheduledTime: z.string().min(1, "موعد التذكير مطلوب"),
  recurrence: z.string().optional(),
});

export type ReminderFormValues = z.infer<typeof reminderSchema>;
