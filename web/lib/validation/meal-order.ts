import { z } from "zod";

export const mealOrderCheckoutSchema = z.object({
  deliveryAddress: z.string().min(1, "عنوان التوصيل مطلوب").max(300, "العنوان طويل جدًا"),
  preferredTime: z.string().min(1, "الوقت المفضل للتوصيل مطلوب"),
});

export type MealOrderCheckoutFormValues = z.infer<typeof mealOrderCheckoutSchema>;
