import { z } from "zod";

export const productOrderCheckoutSchema = z.object({
  deliveryAddress: z.string().min(1, "عنوان التوصيل مطلوب").max(300, "العنوان طويل جدًا"),
});

export type ProductOrderCheckoutFormValues = z.infer<typeof productOrderCheckoutSchema>;
