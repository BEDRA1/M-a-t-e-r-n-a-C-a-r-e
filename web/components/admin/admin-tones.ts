import type { BookingStatus, SubscriptionStatus } from "@/lib/types";

// أخضر للإيجابي، أحمر للتنبيه — نفس دلالات Badge في واجهة الأم لكن بلوحة ألوان داكنة
export function bookingTone(status: BookingStatus): "neutral" | "positive" | "alert" | "warning" {
  switch (status) {
    case "pending":
      return "warning";
    case "confirmed":
      return "positive";
    case "completed":
      return "neutral";
    case "cancelled":
      return "alert";
  }
}

export function subscriptionTone(status: SubscriptionStatus): "neutral" | "positive" | "alert" {
  switch (status) {
    case "active":
      return "positive";
    case "expired":
      return "neutral";
    case "cancelled":
      return "alert";
  }
}
