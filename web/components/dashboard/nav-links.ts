import type { LucideIcon } from "lucide-react";
import {
  Apple,
  Baby,
  Bell,
  BookOpen,
  Bot,
  Brain,
  Calculator,
  CalendarDays,
  CircleUser,
  ClipboardCheck,
  ClipboardList,
  Crown,
  GraduationCap,
  Heart,
  HeartPulse,
  History,
  House,
  LayoutDashboard,
  Menu,
  MessageCircleHeart,
  Pill,
  Salad,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  SmilePlus,
  Sparkles,
} from "lucide-react";
import type { UserRole } from "@/lib/types";

export interface DashboardNavChild {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface DashboardNavItem {
  href?: string;
  label: string;
  icon: LucideIcon;
  children?: DashboardNavChild[];
}

/** يفتح فقط للأخصائي المعتمد (role = specialist) — يُضاف ديناميكيًا عبر getDashboardNavItems،
 * ومُصدَّر أيضًا لأن قائمة "المزيد" المنبثقة في FloatingPillNav تحتاجه مباشرة بعد إزالة
 * الشريط الجانبي الذي كان يحتضنه ضمن عناصر "الاستشارات" الفرعية.
 * يوجّه إلى مساحة عمل الأخصائي المستقلة (/specialist — حجوزات، مريضات، ملاحظات كلينيكية)؛
 * إدارة الدورات وحدها بقيت في الصفحة القديمة تحت لوحة الأم (/dashboard/consultations/specialist-panel)
 * وتبقى قابلة للوصول عبر رابط مباشر داخل مساحة العمل الجديدة نفسها */
export const specialistPanelChild: DashboardNavChild = {
  href: "/specialist",
  label: "لوحة الأخصائي",
  icon: LayoutDashboard,
};

/** يظهر فقط لدور admin — يُضاف ديناميكيًا عبر getDashboardNavItems، ومُصدَّر لنفس سبب
 * specialistPanelChild أعلاه */
export const adminAuditLogItem: DashboardNavItem = {
  href: "/dashboard/admin/audit-logs",
  label: "سجل النشاط الإداري",
  icon: ShieldCheck,
};

/**
 * البنية الكاملة للقائمة الجانبية (sidebar) والقائمة العلوية للتابلت، بالترتيب
 * المطلوب بالضبط. "الحمل" و"الاستشارات" عنصران أبوان يفتحان قائمة فرعية بدل
 * صفحة وسيطة منفصلة — أبسط تقنيًا (لا حاجة لصفحة جديدة) وأقرب لتجربة لوحات
 * التحكم القياسية. التذكيرات أُضيفت كعنصر فرعي ثالث تحت "الحمل" لأنها مرتبطة
 * بمتابعة الحمل حاليًا.
 */
export const dashboardNavItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "الرئيسية", icon: House },
  { href: "/dashboard/articles", label: "المقالات", icon: BookOpen },
  { href: "/dashboard/mood", label: "حالتي المزاجية", icon: SmilePlus },
  { href: "/dashboard/doula", label: "الدولا الرقمية", icon: Bot },
  {
    label: "الحمل",
    icon: HeartPulse,
    children: [
      { href: "/dashboard/pregnancy-calculator", label: "حاسبة الحمل", icon: Calculator },
      { href: "/dashboard/weekly-tracking", label: "المتابعة الأسبوعية", icon: CalendarDays },
      { href: "/dashboard/reminders", label: "التذكيرات", icon: Pill },
    ],
  },
  { href: "/dashboard/postpartum", label: "النفاس", icon: Heart },
  { href: "/dashboard/baby", label: "طفلي", icon: Baby },
  { href: "/dashboard/health-nutrition", label: "الصحة والتغذية", icon: Salad },
  { href: "/dashboard/home-services", label: "الخدمات المنزلية", icon: Sparkles },
  { href: "/dashboard/store", label: "المتجر", icon: ShoppingBag },
  {
    href: "/dashboard/consultations",
    label: "الاستشارات",
    icon: MessageCircleHeart,
    children: [
      { href: "/dashboard/consultations/psychological", label: "المرافقة النفسية", icon: Brain },
      { href: "/dashboard/consultations/health", label: "المرافقة الصحية", icon: HeartPulse },
      { href: "/dashboard/consultations/nutrition", label: "المرافقة الغذائية", icon: Apple },
      { href: "/dashboard/consultations/my-bookings", label: "حجوزاتي", icon: ClipboardList },
      { href: "/dashboard/consultations/my-courses", label: "دوراتي", icon: GraduationCap },
    ],
  },
  {
    href: "/dashboard/assessments",
    label: "التقييم النفسي",
    icon: ClipboardCheck,
    children: [
      { href: "/dashboard/assessments", label: "المقاييس", icon: ClipboardCheck },
      { href: "/dashboard/assessments/history", label: "سجل نتائجي", icon: History },
    ],
  },
  { href: "/dashboard/subscriptions", label: "الخدمات الإضافية", icon: Crown },
  { href: "/dashboard/profile", label: "ملفي الشخصي", icon: CircleUser },
  { href: "/dashboard/settings", label: "الإعدادات", icon: Settings2 },
];

/** يبني نسخة من القائمة تراعي دور المستخدم الحالي (لوحة الأخصائي للأخصائيين، سجل النشاط للإدارة فقط) */
export function getDashboardNavItems(role: UserRole): DashboardNavItem[] {
  if (role === "specialist") {
    return dashboardNavItems.map((item) =>
      item.label === "الاستشارات"
        ? { ...item, children: [...(item.children ?? []), specialistPanelChild] }
        : item,
    );
  }

  if (role === "admin") {
    return [...dashboardNavItems, adminAuditLogItem];
  }

  return dashboardNavItems;
}

/** يطابق المسار الحالي مع رابط عنصر القائمة، بما في ذلك المسارات الفرعية الديناميكية (مثل صفحة تفاصيل أخصائي) */
export function isNavPathActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/dashboard") return false;
  return pathname.startsWith(`${href}/`);
}

/**
 * عناصر إضافية تظهر فقط في شريط الهاتف السفلي أو قائمة "المزيد".
 * "المفضلة" لم تعد أحد التبويبات الخمسة الأساسية (استُبدلت بـ"الدولا" — قرار موثّق
 * في الرد النهائي)، لكنها بقيت هنا لأن MoreSheet يضيفها يدويًا لقائمته حتى لا تُعزَل.
 */
export const bottomNavExtraItems = {
  favorites: { href: "/dashboard/favorites", label: "المفضلة", icon: Heart },
  doula: { href: "/dashboard/doula", label: "الدولا", icon: Bot },
  postpartum: { href: "/dashboard/postpartum", label: "النفاس", icon: Heart },
  notifications: { href: "/dashboard/notifications", label: "الإشعارات", icon: Bell },
  more: { label: "المزيد", icon: Menu },
} as const;
