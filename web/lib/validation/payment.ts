import { z } from "zod";

export const cardPaymentSchema = z.object({
  holderName: z.string().min(1, "اسم صاحب البطاقة مطلوب"),
  cardNumber: z
    .string()
    .transform((v) => v.replace(/\s+/g, ""))
    .refine((v) => /^\d{16}$/.test(v), "رقم البطاقة يجب أن يتكوّن من 16 رقمًا"),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "صيغة تاريخ الانتهاء يجب أن تكون MM/YY"),
  cvv: z.string().regex(/^\d{3}$/, "رمز CVV يجب أن يتكوّن من 3 أرقام"),
});
export type CardPaymentFormValues = z.infer<typeof cardPaymentSchema>;

export const baridimobPhoneSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^(\+213|0)(5|6|7)[0-9]{8}$/, "رقم هاتف جزائري غير صالح"),
});
export type BaridimobPhoneFormValues = z.infer<typeof baridimobPhoneSchema>;

export const otpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "رمز التحقق يجب أن يتكوّن من 6 أرقام"),
});
export type OtpFormValues = z.infer<typeof otpSchema>;
