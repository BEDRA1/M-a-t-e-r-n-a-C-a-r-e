import { z } from "zod";

export const loginSchema = z.object({
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  role: z.enum(["mother", "spouse"], { message: "يرجى اختيار الدور" }),
  wilaya: z.string().optional(),
  email: z.union([z.string().email("البريد الإلكتروني غير صالح"), z.literal("")]).optional(),
  dateOfBirth: z.union([z.string().date("تاريخ الميلاد غير صالح"), z.literal("")]).optional(),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
