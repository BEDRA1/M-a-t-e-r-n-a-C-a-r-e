import type { LucideIcon } from "lucide-react";
import { Brain, HeartPulse, Salad } from "lucide-react";

export type TrackCode = "psychological" | "health" | "nutrition";

export interface TrackColorClasses {
  /** خلفية فاتحة للبطاقات */
  bg: string;
  /** نص بلون المسار */
  text: string;
  /** خلفية داكنة للأيقونة/الشارات البارزة */
  solid: string;
  /** حد بلون المسار */
  border: string;
}

export interface TrackConfig {
  code: TrackCode;
  name: string;
  specialistTitle: string;
  description: string;
  icon: LucideIcon;
  colors: TrackColorClasses;
  consultationIncludes: string[];
  courseFeatures: string[];
  /** صورة غلاف موضوعية لدورات هذا المسار — رابط images.unsplash.com حقيقي تحقّقتُ منه بـcurl
   * مباشرةً (source.unsplash.com المطلوب أصلًا خدمة متوقفة نهائيًا من Unsplash، ترجع 503) */
  courseCoverImage: string;
}

export const TRACKS: Record<TrackCode, TrackConfig> = {
  psychological: {
    code: "psychological",
    name: "المرافقة النفسية",
    specialistTitle: "أخصائية نفسانية",
    description: "دعم نفسي متخصص يرافقك في التعامل مع القلق والتوتر وتقلبات المشاعر خلال رحلتك.",
    icon: Brain,
    colors: {
      bg: "bg-violet-50",
      text: "text-violet-700",
      solid: "bg-violet-500",
      border: "border-violet-200",
    },
    consultationIncludes: [
      "جلسة فردية سرية وآمنة",
      "تقييم الحالة وتحديد الاحتياجات",
      "خطة دعم ومتابعة",
      "متابعة بعد الجلسة عند الحاجة",
    ],
    courseFeatures: [
      "محتوى علمي من إعداد مختصات",
      "تفاعل مباشر مع المدربة والمشاركات",
      "شهادة مشاركة في نهاية الدورة",
      "مواد تعليمية ودعم مستمر",
    ],
    courseCoverImage: "https://images.unsplash.com/photo-1655337690436-98778f38d613?w=400&q=80&auto=format&fit=crop",
  },
  health: {
    code: "health",
    name: "المرافقة الصحية",
    specialistTitle: "قابلة",
    description: "متابعة صحية مهنية من قابلة معتمدة، تواكبك في كل مرحلة من الحمل والاستعداد للولادة.",
    icon: HeartPulse,
    colors: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      solid: "bg-emerald-500",
      border: "border-emerald-200",
    },
    consultationIncludes: [
      "تقييم الحالة الصحية والمتابعة",
      "تقديم إرشادات صحية مناسبة لمرحلة الحمل",
      "متابعة المؤشرات الصحية الأساسية",
      "التوجيه والإجابة عن الاستفسارات الصحية",
    ],
    courseFeatures: [
      "التوعية الصحية أثناء الحمل",
      "الاستعداد للولادة والعناية بالأم",
      "التوعية بالرضاعة والعناية بالطفل",
    ],
    courseCoverImage: "https://images.unsplash.com/photo-1770403490295-c2475cdf8143?w=400&q=80&auto=format&fit=crop",
  },
  nutrition: {
    code: "nutrition",
    name: "المرافقة الغذائية",
    specialistTitle: "أخصائية تغذية",
    description: "برنامج غذائي مخصص من أخصائية تغذية، يواكب احتياجاتك الغذائية في كل مرحلة.",
    icon: Salad,
    colors: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      solid: "bg-amber-500",
      border: "border-amber-200",
    },
    consultationIncludes: [
      "إعداد برنامج غذائي مناسب",
      "تحديد الاحتياجات الغذائية حسب مرحلة الحمل",
      "إرشادات غذائية مخصصة لكل مرحلة",
      "متابعة وتعديل الخطة الغذائية عند الحاجة",
    ],
    courseFeatures: [
      "التوعية بالتغذية الصحية خلال رحلة الألف يوم",
      "كيفية إعداد وجبات متوازنة",
      "التغذية في فترة الرضاعة",
      "نصائح عملية وتطبيقية",
    ],
    courseCoverImage: "https://images.unsplash.com/photo-1683105555403-4c4cae4e2298?w=400&q=80&auto=format&fit=crop",
  },
};

export const TRACK_LIST: TrackConfig[] = Object.values(TRACKS);

export function isTrackCode(value: string): value is TrackCode {
  return value === "psychological" || value === "health" || value === "nutrition";
}

/** صورة غلاف دورة حسب مسار الأخصائية المالكة لها — تعود لصورة المسار النفسي افتراضيًا في
 * الحالة النادرة لعدم توفر track (مثلًا استجابة قديمة مخزَّنة مؤقتًا) */
export function courseCoverImage(track: TrackCode | undefined): string {
  return TRACKS[track ?? "psychological"].courseCoverImage;
}

// تصفية عرض من طرف الواجهة فقط — لا حذف من قاعدة البيانات. مسار "المرافقة النفسية" يعرض
// فقط أخصائيتَي الاستشارات الحقيقيتين المعتمدتين حاليًا (فاضل آية، بن الشارف فلة) ويُخفي
// بقية السجلات (التجريبية القديمة + سجلّا اختبار تاليَي/عامّا الاسم اكتُشفا لاحقًا عبر الـAPI
// الحي) — الحجز يكون معهما مباشرة. أُبقيت هذه القائمة محدَّثة يدويًا لتطابق أحدث تسمية في
// seed.ts (رُحّلت الأسماء فعليًا هناك في مهمة سابقة، لذا لم يعد هذا مجرد TODO معلَّق).
// مساريّ "الصحية" و"الغذائية" لا يحتاجان تصفية — كل منهما يملك أخصائية واحدة فقط أصلًا.
const PSYCHOLOGICAL_TRACK_VISIBLE_NAMES = ["فاضل آية", "بن الشارف فلة"];

export function filterVisibleSpecialists<T extends { fullName: string }>(
  track: TrackCode | undefined,
  specialists: T[],
): T[] {
  if (track === "psychological") {
    return specialists.filter((s) => PSYCHOLOGICAL_TRACK_VISIBLE_NAMES.includes(s.fullName));
  }
  return specialists;
}

// تراكب صورة الأخصائية من طرف الواجهة فقط — يستبدل photoUrl الآتي من الـAPI (صور Unsplash
// عامة مؤقتة) بالصور المحلية الحقيقية الموجودة الآن في public/specialists/ للأشخاص الخمسة
// المطلوبين تحديدًا؛ لأي أخصائية أخرى يبقى photoUrl الأصلي من الـAPI كما هو دون تغيير.
// عند غياب الملف أو فشل تحميله يتولى ImageWithFallback عرض أيقونة User على دائرة وردية فاتحة
// تلقائيًا — نفس النمط المُطبَّق أصلًا في كل مكان بالتطبيق، لا حاجة لمكوّن fallback جديد.
const SPECIALIST_PHOTO_OVERRIDES: Record<string, string> = {
  "فاضل آية": "/specialists/fadhel-aya.jpg",
  "بن الشارف فلة": "/specialists/bencheref-fella.jpg",
  "بن جديدي سعاد": "/specialists/benjdidi-souad.jpg",
  "سلمي أسماء": "/specialists/salmi-asma.png",
  "فلالي هناء": "/specialists/fellali-hanaa.jpg",
};

export function specialistPhotoSrc(specialist: { fullName: string; photoUrl: string | null }): string | null {
  return SPECIALIST_PHOTO_OVERRIDES[specialist.fullName] ?? specialist.photoUrl;
}
