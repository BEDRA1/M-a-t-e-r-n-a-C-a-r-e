import { z } from "zod";

export const createCourseSchema = z
  .object({
    title: z.string().min(3, "عنوان الدورة قصير جدًا").max(150, "العنوان طويل جدًا"),
    description: z.string().min(10, "وصف الدورة قصير جدًا").max(3000, "الوصف طويل جدًا"),
    type: z.enum(["in_person", "remote"], { message: "نوع الدورة مطلوب" }),
    capacity: z.string().optional(),
    startDate: z.string().min(1, "تاريخ بدء الدورة مطلوب"),
    durationText: z.string().min(1, "مدة الدورة مطلوبة").max(100, "النص طويل جدًا"),
    durationDays: z
      .string()
      .min(1, "مدة الدورة بالأيام مطلوبة")
      .regex(/^\d+$/, "يجب أن تكون رقمًا صحيحًا"),
    price: z.string().min(1, "السعر مطلوب").regex(/^\d+$/, "يجب أن يكون رقمًا صحيحًا"),
    contentUrl: z.string().optional(),
    wilaya: z.string().optional(),
  })
  .refine((data) => data.type !== "in_person" || Boolean(data.capacity && /^\d+$/.test(data.capacity)), {
    message: "السعة مطلوبة للدورات الحضورية",
    path: ["capacity"],
  })
  .refine((data) => data.type !== "in_person" || Boolean(data.wilaya?.trim()), {
    message: "الولاية مطلوبة للدورات الحضورية",
    path: ["wilaya"],
  })
  .refine((data) => data.type !== "remote" || Boolean(data.contentUrl?.trim()), {
    message: "رابط المحتوى مطلوب للدورات عن بُعد",
    path: ["contentUrl"],
  });

export type CreateCourseFormValues = z.infer<typeof createCourseSchema>;
