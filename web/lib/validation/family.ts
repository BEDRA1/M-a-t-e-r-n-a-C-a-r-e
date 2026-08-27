import { z } from "zod";

export const joinFamilySchema = z.object({
  inviteCode: z
    .string()
    .length(6, "كود الدعوة يجب أن يتكون من 6 أحرف")
    .transform((v) => v.toUpperCase()),
});

export type JoinFamilyFormValues = z.infer<typeof joinFamilySchema>;
