import type { MealOrderStatus, ProductOrderStatus, ServiceBookingStatus } from "@/lib/types";

type Tone = "neutral" | "positive" | "alert" | "warning";

export interface Workflow<S extends string> {
  labels: Record<S, string>;
  tones: Record<S, Tone>;
  /** الخطوة التالية في المسار الأمامي (بلا الإلغاء) — null للحالات النهائية */
  next: Record<S, S | null>;
  /** الحالات التي يُسمح منها بالإلغاء */
  cancellableFrom: S[];
  cancelled: S;
}

// نسخة عرض فقط من ALLOWED_*_TRANSITIONS في الـBackend (nutrition/store/home-services services) —
// الخادم هو المرجع ويرفض أي انتقال غير مسموح بـ400 حتى لو اختلفت هذه النسخة يومًا

export const MEAL_WORKFLOW: Workflow<MealOrderStatus> = {
  labels: {
    pending: "جديد",
    confirmed: "قيد التحضير",
    out_for_delivery: "في الطريق",
    delivered: "تم التسليم",
    cancelled: "ملغى",
  },
  tones: { pending: "alert", confirmed: "warning", out_for_delivery: "warning", delivered: "positive", cancelled: "neutral" },
  next: { pending: "confirmed", confirmed: "out_for_delivery", out_for_delivery: "delivered", delivered: null, cancelled: null },
  cancellableFrom: ["pending", "confirmed"],
  cancelled: "cancelled",
};

export const PRODUCT_WORKFLOW: Workflow<ProductOrderStatus> = {
  labels: {
    pending: "جديد",
    confirmed: "قيد التحضير",
    shipped: "في الطريق",
    delivered: "تم التسليم",
    cancelled: "ملغى",
  },
  tones: { pending: "alert", confirmed: "warning", shipped: "warning", delivered: "positive", cancelled: "neutral" },
  next: { pending: "confirmed", confirmed: "shipped", shipped: "delivered", delivered: null, cancelled: null },
  cancellableFrom: ["pending", "confirmed"],
  cancelled: "cancelled",
};

export const SERVICE_WORKFLOW: Workflow<ServiceBookingStatus> = {
  labels: { pending: "جديد", confirmed: "مؤكد", completed: "تم", cancelled: "ملغى" },
  tones: { pending: "alert", confirmed: "warning", completed: "positive", cancelled: "neutral" },
  next: { pending: "confirmed", confirmed: "completed", completed: null, cancelled: null },
  cancellableFrom: ["pending", "confirmed"],
  cancelled: "cancelled",
};

export type DateRange = "all" | "today" | "week";

/** هل التاريخ ضمن اليوم/هذا الأسبوع (بالتوقيت المحلي). الأسبوع يبدأ الأحد — أسبوع العمل في الجزائر */
export function inDateRange(iso: string, range: DateRange): boolean {
  if (range === "all") return true;
  const d = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === "today") {
    const end = new Date(startOfToday);
    end.setDate(end.getDate() + 1);
    return d >= startOfToday && d < end;
  }
  const start = new Date(startOfToday);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return d >= start && d < end;
}
