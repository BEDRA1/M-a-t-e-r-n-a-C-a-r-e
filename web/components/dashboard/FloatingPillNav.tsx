"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Baby,
  Bot,
  Brain,
  BookOpen,
  GraduationCap,
  House,
  MessageCircleHeart,
  MoreHorizontal,
  ShoppingBag,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { useLogout } from "@/lib/hooks/useAuth";
import { useMySubscriptions } from "@/lib/hooks/useSubscriptions";
import {
  dashboardNavItems,
  isNavPathActive,
  adminAuditLogItem,
  specialistPanelChild,
  type DashboardNavItem,
} from "./nav-links";
import type { User } from "@/lib/types";

const roleLabel: Record<User["role"], string> = {
  mother: "أم",
  spouse: "زوج مرافق",
  admin: "مسؤول",
  specialist: "أخصائي/ة",
};

interface PillItem {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
  sourceLabel: string;
  isDoula?: boolean;
}

// السبع عناصر المباشرة في الكبسولة — العنصر الثامن "المزيد" مُدار بمنطق منفصل (زر يفتح
// popover لا رابط). أيقونة/تسمية كل عنصر هنا مقصودة لتكون أقصر/أنسب لمساحة الكبسولة من
// أصلها في nav-links.ts (مثال: "الدولا" بدل "الدولا الرقمية")، لكن sourceLabel يربطها
// بمصدرها الحقيقي هناك لحساب حالة "نشط" دون تكرار منطق المسارات الفرعية يدويًا.
// "الحمل" تحديدًا بلا href خاص بها في nav-links.ts (عنصر أب بقائمة فرعية فقط)، فوُجّهت هنا
// لأقرب صفحة تمثّلها فعليًا (المتابعة الأسبوعية) مع اعتبارها نشطة أيضًا لو كانت الصفحة
// الحالية أيًا من أخواتها الثلاث (حاسبة الحمل/المتابعة الأسبوعية/التذكيرات).
const PILL_ITEMS: PillItem[] = [
  { key: "home", label: "الرئيسية", icon: House, href: "/dashboard", sourceLabel: "الرئيسية" },
  { key: "pregnancy", label: "الحمل", icon: Baby, href: "/dashboard/weekly-tracking", sourceLabel: "الحمل" },
  {
    key: "consultations",
    label: "الاستشارات",
    icon: MessageCircleHeart,
    href: "/dashboard/consultations",
    sourceLabel: "الاستشارات",
  },
  {
    key: "doula",
    label: "الدولا",
    icon: Bot,
    href: "/dashboard/doula",
    sourceLabel: "الدولا الرقمية",
    isDoula: true,
  },
  {
    key: "assessments",
    label: "التقييمات",
    icon: Brain,
    href: "/dashboard/assessments",
    sourceLabel: "التقييم النفسي",
  },
  { key: "articles", label: "المقالات", icon: BookOpen, href: "/dashboard/articles", sourceLabel: "المقالات" },
  { key: "store", label: "المتجر", icon: ShoppingBag, href: "/dashboard/store", sourceLabel: "المتجر" },
];

// العناصر التسعة المتبقية داخل popover "المزيد" — كل قائمة التنقل الكاملة عدا السبعة أعلاه
// والرئيسية. مبنية من dashboardNavItems مباشرة (لا تكرار يدوي للـhref/icon) عبر labels محددة.
const MORE_LABELS = [
  "النفاس",
  "طفلي",
  "الصحة والتغذية",
  "الخدمات المنزلية",
  "حالتي المزاجية",
  "الخدمات الإضافية",
  "ملفي الشخصي",
  "الإعدادات",
];

// تسميات مختصرة لعرض شبكة الـpopover فقط (المساحة ثلاثة أعمدة ضيّقة) — labels الأصلية في
// dashboardNavItems تبقى كما هي لبقية الموقع (سايدبار سابقًا، MoreSheet للموبايل...)
const SHORT_LABELS: Record<string, string> = {
  "حالتي المزاجية": "المزاج",
  "ملفي الشخصي": "ملفي",
};

function isSourceItemActive(pathname: string, sourceItem: DashboardNavItem | undefined): boolean {
  if (!sourceItem) return false;
  if (sourceItem.href && isNavPathActive(pathname, sourceItem.href)) return true;
  return Boolean(sourceItem.children?.some((c) => isNavPathActive(pathname, c.href)));
}

function MorePopover({
  user,
  onClose,
  bookingCredits,
}: {
  user: User;
  onClose: () => void;
  bookingCredits: number | undefined;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const shouldReduceMotion = useReducedMotion();

  const baseItems = MORE_LABELS.map((label) => dashboardNavItems.find((i) => i.label === label)).filter(
    (i): i is DashboardNavItem => Boolean(i),
  );
  // الاستشارات في الكبسولة تفتح المسار الأب فقط دون فرعيّاتها الأربع (دوراتي، حجوزاتي...)
  // لأن "الدورات" كوجهة اكتشاف عامة تحتاج مكانًا مباشرًا في "المزيد" — تربطها بصفحة كتالوج
  // الدورات القائمة فعلًا (/dashboard/consultations/courses) لا بـ"دوراتي" (الأنسب للاكتشاف)
  const coursesItem: DashboardNavItem = {
    href: "/dashboard/consultations/courses",
    label: "الدورات",
    icon: GraduationCap,
  };
  const roleExtraItems =
    user.role === "admin" ? [adminAuditLogItem] : user.role === "specialist" ? [specialistPanelChild] : [];

  const gridItems: DashboardNavItem[] = [...baseItems, coursesItem, ...roleExtraItems];

  const handleLogout = async () => {
    await logout.mutateAsync();
    onClose();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <div className="pointer-events-auto fixed inset-0 z-50" onClick={onClose} aria-hidden="true" />
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 12 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: "easeOut" }}
        style={{ transformOrigin: "bottom center" }}
        className="pointer-events-auto fixed inset-x-0 bottom-28 z-[60] mx-auto w-[min(28rem,calc(100vw-2rem))] rounded-[var(--radius-card)] border border-black/5 bg-surface p-4 shadow-2xl"
      >
        <div className="grid grid-cols-3 gap-2">
          {gridItems.map((item) => {
            const active = isSourceItemActive(pathname, item);
            const showCreditsBadge = item.label === "الخدمات الإضافية" && Boolean(bookingCredits && bookingCredits > 0);
            return (
              <Link
                key={item.label}
                href={item.href!}
                onClick={onClose}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-center text-xs font-medium transition-colors",
                  active ? "bg-primary-500 text-white" : "text-foreground/70 hover:bg-primary-50",
                )}
              >
                <item.icon className="size-5" strokeWidth={2} />
                <span className="leading-tight">{SHORT_LABELS[item.label] ?? item.label}</span>
                {showCreditsBadge && (
                  <span
                    className={cn(
                      "absolute -end-1 -top-1 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      active ? "bg-white/20 text-white" : "bg-primary-100 text-primary-700",
                    )}
                  >
                    <Stethoscope className="size-2.5" strokeWidth={2.5} />
                    {bookingCredits}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-black/5 px-1 pt-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{user.phone}</p>
            <span className="mt-0.5 inline-flex rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
              {roleLabel[user.role]}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} loading={logout.isPending}>
            تسجيل الخروج
          </Button>
        </div>
      </motion.div>
    </>
  );
}

/** كبسولة تنقل عائمة ثابتة تحل محل الشريط الجانبي بالكامل على الديسكتوب (lg+) */
export function FloatingPillNav({ user }: { user: User }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [moreOpen, setMoreOpen] = useState(false);

  const mySubscriptions = useMySubscriptions();
  const bookingCredits = mySubscriptions.data
    ?.filter((s) => s.status === "active" && !s.plan.unlimitedBookings)
    .reduce((sum, s) => sum + s.bookingCreditsRemaining, 0);

  // الصفحة الرئيسية لها شريطها السفلي الخاص (DashboardBottomNav) الظاهر الآن على كل
  // الأحجام بما فيها الديسكتوب، فتُخفى الكبسولة العائمة هناك تحديدًا لتفادي ازدواج التنقل
  if (pathname === "/dashboard") return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 hidden justify-center lg:flex">
      <motion.nav
        initial={shouldReduceMotion ? false : { opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease: "easeOut" }}
        className="pointer-events-auto flex h-16 items-center gap-1 rounded-full border border-black/5 bg-white/85 px-2 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),0_8px_32px_rgba(233,30,140,0.15)] backdrop-blur-md"
      >
        {PILL_ITEMS.map((item) => {
          const sourceItem = dashboardNavItems.find((i) => i.label === item.sourceLabel);
          // moreOpen يُسكِت تنشيط عناصر الصفحة الحالية مؤقتًا كي لا يشارك عنصران نفس
          // layoutId في آن واحد (فرامر موشن لا يدعم ذلك) — زر "المزيد" وحده يحمل الخلفية
          // النشطة طالما القائمة المنبثقة مفتوحة
          const active = !moreOpen && isSourceItemActive(pathname, sourceItem);
          const activeBg = item.isDoula ? "bg-doula-500" : "bg-primary-500";
          const inactiveText = item.isDoula ? "text-doula-600" : "text-foreground/70";

          return (
            <Link
              key={item.key}
              href={item.href}
              className="relative flex w-16 flex-col items-center justify-center gap-0.5 rounded-full px-2 py-2"
            >
              {active && (
                <motion.span
                  layoutId="floating-pill-active-bg"
                  className={cn("absolute inset-0 rounded-full", activeBg)}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 380, damping: 32 }
                  }
                />
              )}
              <span
                className={cn(
                  "relative z-10 flex flex-col items-center gap-0.5",
                  active ? "text-white" : inactiveText,
                )}
              >
                <item.icon className="size-5" strokeWidth={2} />
                <span className="text-[11px] font-medium leading-none">{item.label}</span>
              </span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          className="relative flex w-16 flex-col items-center justify-center gap-0.5 rounded-full px-2 py-2"
        >
          {moreOpen && (
            <motion.span
              layoutId="floating-pill-active-bg"
              className="absolute inset-0 rounded-full bg-primary-500"
              transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
            />
          )}
          <span
            className={cn(
              "relative z-10 flex flex-col items-center gap-0.5",
              moreOpen ? "text-white" : "text-foreground/70",
            )}
          >
            <MoreHorizontal className="size-5" strokeWidth={2} />
            <span className="text-[11px] font-medium leading-none">المزيد</span>
          </span>
        </button>
      </motion.nav>

      <AnimatePresence>
        {moreOpen && (
          <MorePopover user={user} onClose={() => setMoreOpen(false)} bookingCredits={bookingCredits} />
        )}
      </AnimatePresence>
    </div>
  );
}
