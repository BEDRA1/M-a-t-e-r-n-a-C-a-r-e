import type {
  AssessmentClassification,
  BookingStatus,
  ConsultationType,
  MealOrderStatus,
  MealType,
  NotificationType,
  PaymentMethod,
  ProductOrderStatus,
  ReminderType,
  ServiceBookingStatus,
  SubscriptionStatus,
  UrgentHelpStatus,
  UserRole,
} from "./types";

export function formatArabicDate(dateString: string): string {
  return new Intl.DateTimeFormat("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}

export function formatArabicDateTime(dateString: string): string {
  return new Intl.DateTimeFormat("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(new Date(dateString));
}

const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  vitamin: "فيتامينات",
  medication: "دواء",
  water: "شرب الماء",
  appointment: "موعد طبي",
  other: "أخرى",
};

export function reminderTypeLabel(type: ReminderType): string {
  return REMINDER_TYPE_LABELS[type] ?? type;
}

const CALC_METHOD_LABELS: Record<string, string> = {
  lmp: "آخر دورة شهرية",
  ovulation: "تاريخ الإباضة",
  ultrasound: "فحص السونار",
};

export function calcMethodLabel(method: string): string {
  return CALC_METHOD_LABELS[method] ?? method;
}

const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  booking_confirmed: "تأكيد حجز",
  appointment_reminder: "تذكير بموعد",
  general: "عام",
  vaccination_reminder: "تذكير بالتلقيحات",
  daily_tip: "نصيحة اليوم",
};

export function notificationTypeLabel(type: NotificationType): string {
  return NOTIFICATION_TYPE_LABELS[type] ?? type;
}

const CONSULTATION_TYPE_LABELS: Record<ConsultationType, string> = {
  in_person: "حضوري",
  remote: "عن بعد",
};

export function consultationTypeLabel(type: ConsultationType): string {
  return CONSULTATION_TYPE_LABELS[type] ?? type;
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card: "بطاقة بنكية",
  ccp: "حساب بريدي (CCP)",
  baridimob: "بريدي موب (BaridiMob)",
  pay_at_attendance: "الدفع عند الحضور",
};

export function paymentMethodLabel(method: PaymentMethod): string {
  return PAYMENT_METHOD_LABELS[method] ?? method;
}

const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "بانتظار التأكيد",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغى",
};

export function bookingStatusLabel(status: BookingStatus): string {
  return BOOKING_STATUS_LABELS[status] ?? status;
}

export function bookingStatusBadgeTone(
  status: BookingStatus,
): "warning" | "success" | "neutral" | "danger" {
  switch (status) {
    case "pending":
      return "warning";
    case "confirmed":
      return "success";
    case "completed":
      return "neutral";
    case "cancelled":
      return "danger";
    default:
      return "neutral";
  }
}

/** يُعيد لفظ الجمع العربي الصحيح (مفرد/مثنى/جمع) لعدد صغير — يكفي هنا لأن أعمار الأطفال 0-2 سنة تقريبًا */
function arabicCount(n: number, forms: { one: string; two: string; plural: string }): string {
  if (n === 1) return forms.one;
  if (n === 2) return forms.two;
  return `${n} ${forms.plural}`;
}

/** عمر الطفل بصيغة عربية مقروءة، مثل "6 أشهر و10 أيام" أو "سنة وشهرين" */
export function formatBabyAge(birthDateIso: string): string {
  const birth = new Date(birthDateIso);
  const now = new Date();

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const daysInPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += daysInPrevMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts: string[] = [];
  if (years > 0) parts.push(arabicCount(years, { one: "سنة واحدة", two: "سنتين", plural: "سنوات" }));
  if (months > 0) parts.push(arabicCount(months, { one: "شهر واحد", two: "شهرين", plural: "أشهر" }));
  if (years === 0 && (months === 0 || days > 0)) {
    parts.push(arabicCount(days, { one: "يوم واحد", two: "يومين", plural: "يومًا" }));
  }

  return parts.length > 0 ? parts.join(" و") : "وليد اليوم";
}

const BABY_GENDER_LABELS: Record<"male" | "female", string> = {
  male: "ذكر",
  female: "أنثى",
};

export function babyGenderLabel(gender: "male" | "female"): string {
  return BABY_GENDER_LABELS[gender] ?? gender;
}

export type CheckupStatus = "upcoming" | "completed" | "missed";

export function getCheckupStatus(checkup: { completed: boolean; scheduledDate: string }): CheckupStatus {
  if (checkup.completed) return "completed";
  return new Date(checkup.scheduledDate).getTime() < Date.now() ? "missed" : "upcoming";
}

const CHECKUP_STATUS_LABELS: Record<CheckupStatus, string> = {
  upcoming: "قادم",
  completed: "مكتمل",
  missed: "فات موعده",
};

export function checkupStatusLabel(status: CheckupStatus): string {
  return CHECKUP_STATUS_LABELS[status];
}

export function checkupStatusBadgeTone(status: CheckupStatus): "accent" | "success" | "danger" {
  switch (status) {
    case "upcoming":
      return "accent";
    case "completed":
      return "success";
    case "missed":
      return "danger";
  }
}

const MOOD_LEVEL_LABELS: Record<number, string> = {
  1: "متعبة جدًا",
  2: "متعبة",
  3: "عادية",
  4: "جيدة",
  5: "ممتازة",
};

export function moodLevelLabel(level: number): string {
  return MOOD_LEVEL_LABELS[level] ?? String(level);
}

export function formatDzd(amount: number): string {
  return `${amount.toLocaleString("ar-DZ")} دج`;
}

// تراكب عرض اسم الخدمة المنزلية من طرف الواجهة فقط — الاسم المخزَّن في قاعدة البيانات
// (HomeService.name) لم يتغيّر، فقط ما يظهر للمستخدمة تغيّر بطلب صريح
const HOME_SERVICE_NAME_OVERRIDES: Record<string, string> = {
  "طبخ منزلي": "الأكل الصحي",
  "رعاية بعد الولادة": "التمريض المنزلي",
};

export function homeServiceDisplayName(name: string): string {
  return HOME_SERVICE_NAME_OVERRIDES[name] ?? name;
}

const DAY_OF_WEEK_LABELS: Record<number, string> = {
  0: "الأحد",
  1: "الإثنين",
  2: "الثلاثاء",
  3: "الأربعاء",
  4: "الخميس",
  5: "الجمعة",
  6: "السبت",
};

export function dayOfWeekLabel(day: number): string {
  return DAY_OF_WEEK_LABELS[day] ?? String(day);
}

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  lunch: "الغداء",
  dinner: "العشاء",
};

export function mealTypeLabel(type: MealType): string {
  return MEAL_TYPE_LABELS[type] ?? type;
}

const MEAL_ORDER_STATUS_LABELS: Record<MealOrderStatus, string> = {
  pending: "بانتظار التأكيد",
  confirmed: "مؤكد",
  out_for_delivery: "في الطريق إليك",
  delivered: "تم التوصيل",
  cancelled: "ملغى",
};

export function mealOrderStatusLabel(status: MealOrderStatus): string {
  return MEAL_ORDER_STATUS_LABELS[status] ?? status;
}

export function mealOrderStatusBadgeTone(
  status: MealOrderStatus,
): "warning" | "accent" | "success" | "danger" | "neutral" {
  switch (status) {
    case "pending":
      return "warning";
    case "confirmed":
      return "accent";
    case "out_for_delivery":
      return "accent";
    case "delivered":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "neutral";
  }
}

const SERVICE_BOOKING_STATUS_LABELS: Record<ServiceBookingStatus, string> = {
  pending: "بانتظار التأكيد",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغى",
};

export function serviceBookingStatusLabel(status: ServiceBookingStatus): string {
  return SERVICE_BOOKING_STATUS_LABELS[status] ?? status;
}

export function serviceBookingStatusBadgeTone(
  status: ServiceBookingStatus,
): "warning" | "accent" | "success" | "danger" {
  switch (status) {
    case "pending":
      return "warning";
    case "confirmed":
      return "accent";
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
  }
}

const PRODUCT_ORDER_STATUS_LABELS: Record<ProductOrderStatus, string> = {
  pending: "بانتظار التأكيد",
  confirmed: "مؤكد",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  cancelled: "ملغى",
};

export function productOrderStatusLabel(status: ProductOrderStatus): string {
  return PRODUCT_ORDER_STATUS_LABELS[status] ?? status;
}

export function productOrderStatusBadgeTone(
  status: ProductOrderStatus,
): "warning" | "accent" | "success" | "danger" | "neutral" {
  switch (status) {
    case "pending":
      return "warning";
    case "confirmed":
      return "accent";
    case "shipped":
      return "accent";
    case "delivered":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "neutral";
  }
}

export type StockStatus = "available" | "limited" | "out";

const LOW_STOCK_THRESHOLD = 3;

export function getStockStatus(stockQuantity: number): StockStatus {
  if (stockQuantity <= 0) return "out";
  if (stockQuantity <= LOW_STOCK_THRESHOLD) return "limited";
  return "available";
}

const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  available: "متوفر",
  limited: "الكمية محدودة",
  out: "نفد المخزون",
};

export function stockStatusLabel(status: StockStatus): string {
  return STOCK_STATUS_LABELS[status];
}

export function stockStatusBadgeTone(status: StockStatus): "success" | "warning" | "danger" {
  switch (status) {
    case "available":
      return "success";
    case "limited":
      return "warning";
    case "out":
      return "danger";
  }
}

const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: "نشط",
  expired: "منتهٍ",
  cancelled: "ملغى",
};

export function subscriptionStatusLabel(status: SubscriptionStatus): string {
  return SUBSCRIPTION_STATUS_LABELS[status] ?? status;
}

export function subscriptionStatusBadgeTone(status: SubscriptionStatus): "success" | "neutral" | "danger" {
  switch (status) {
    case "active":
      return "success";
    case "expired":
      return "neutral";
    case "cancelled":
      return "danger";
  }
}

const LOW_SEATS_THRESHOLD = 3;

export type SeatsStatus = "available" | "limited" | "full";

/** capacity=null تعني دورة عن بُعد بلا حد للمقاعد — لا حالة سعة لها أصلًا */
export function getSeatsStatus(capacity: number, enrolledCount: number): SeatsStatus {
  const remaining = capacity - enrolledCount;
  if (remaining <= 0) return "full";
  if (remaining <= LOW_SEATS_THRESHOLD) return "limited";
  return "available";
}

const SEATS_STATUS_LABELS: Record<SeatsStatus, string> = {
  available: "مقاعد متاحة",
  limited: "مقاعد محدودة",
  full: "اكتملت السعة",
};

export function seatsStatusLabel(status: SeatsStatus): string {
  return SEATS_STATUS_LABELS[status];
}

export function seatsStatusBadgeTone(status: SeatsStatus): "success" | "warning" | "danger" {
  switch (status) {
    case "available":
      return "success";
    case "limited":
      return "warning";
    case "full":
      return "danger";
  }
}

/** موعد اكتمال الدورة فعليًا (بداية + مدة بالأيام) — نفس حساب issueCertificate في الـbackend بالضبط */
export function getCourseCompletionDate(course: { startDate: string; durationDays: number }): Date {
  return new Date(new Date(course.startDate).getTime() + course.durationDays * 24 * 60 * 60 * 1000);
}

export function isCourseCompleted(course: { startDate: string; durationDays: number }): boolean {
  return Date.now() >= getCourseCompletionDate(course).getTime();
}

const USER_ROLE_LABELS: Record<UserRole, string> = {
  mother: "أم",
  spouse: "زوج مرافق",
  admin: "مسؤول",
  specialist: "أخصائي/ة",
};

export function userRoleLabel(role: UserRole): string {
  return USER_ROLE_LABELS[role] ?? role;
}

// تصنيفا GAD-7 وEPDS مستقلان تمامًا رغم مشاركتهما بعض قيم enum نفسه (low/high) —
// دالتان منفصلتان تتجنبان أي خلط بين معنى القيمة في كل مقياس
const GAD7_CLASSIFICATION_LABELS: Partial<Record<AssessmentClassification, string>> = {
  minimal: "بسيط جدًا",
  mild: "خفيف",
  moderate: "متوسط",
  severe: "شديد",
};

export function gad7ClassificationLabel(classification: AssessmentClassification): string {
  return GAD7_CLASSIFICATION_LABELS[classification] ?? classification;
}

export function gad7ClassificationTone(classification: AssessmentClassification): "success" | "accent" | "warning" | "danger" {
  switch (classification) {
    case "minimal":
      return "success";
    case "mild":
      return "accent";
    case "moderate":
      return "warning";
    case "severe":
      return "danger";
    default:
      return "accent";
  }
}

const EPDS_CLASSIFICATION_LABELS: Partial<Record<AssessmentClassification, string>> = {
  low: "منخفض",
  needs_followup: "يستدعي المتابعة",
  high: "مرتفع",
};

export function epdsClassificationLabel(classification: AssessmentClassification): string {
  return EPDS_CLASSIFICATION_LABELS[classification] ?? classification;
}

export function epdsClassificationTone(classification: AssessmentClassification): "success" | "warning" | "danger" {
  switch (classification) {
    case "low":
      return "success";
    case "needs_followup":
      return "warning";
    case "high":
      return "danger";
    default:
      return "warning";
  }
}

const URGENT_HELP_STATUS_LABELS: Record<UrgentHelpStatus, string> = {
  open: "مفتوح",
  contacted: "تم التواصل",
  closed: "مغلق",
};

export function urgentHelpStatusLabel(status: UrgentHelpStatus): string {
  return URGENT_HELP_STATUS_LABELS[status] ?? status;
}

export function urgentHelpStatusTone(status: UrgentHelpStatus): "danger" | "warning" | "success" {
  switch (status) {
    case "open":
      return "danger";
    case "contacted":
      return "warning";
    case "closed":
      return "success";
  }
}

/** يُبقي أول رقمين وآخر رقمين ظاهرين، ويستر الباقي بـX — نفس منطق الـbackend لعرض رقم مريضة في واجهة الأخصائي */
export function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  const start = phone.slice(0, 2);
  const end = phone.slice(-2);
  const middle = "X".repeat(phone.length - 4);
  return `${start}${middle}${end}`;
}
