import { Bot, Calendar, Droplets, Heart, Salad, Smile, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface StaticNotificationItem {
  title: string;
  body: string;
  icon: LucideIcon;
  color: "green" | "blue" | "pink" | "emerald" | "purple";
}

const COLOR_CLASSES: Record<StaticNotificationItem["color"], string> = {
  green: "bg-green-100 text-green-600",
  blue: "bg-blue-100 text-blue-600",
  pink: "bg-pink-100 text-pink-600",
  emerald: "bg-emerald-100 text-emerald-600",
  purple: "bg-purple-100 text-purple-600",
};

const STATIC_NOTIFICATIONS: StaticNotificationItem[] = [
  {
    title: "مرحباً بكِ في Materna Care",
    body: "نحن هنا لمرافقتكِ في كل خطوة من رحلة الألف يوم",
    icon: Heart,
    color: "purple",
  },
  {
    title: "نصيحة اليوم",
    body: "احرصي على شرب 8 أكواب من الماء يومياً للحفاظ على ترطيب جسمكِ",
    icon: Droplets,
    color: "green",
  },
  {
    title: "موعد فحصكِ القادم",
    body: "لا تنسي متابعة مواعيد الفحوصات الدورية مع طبيبتكِ أو قابلتكِ",
    icon: Calendar,
    color: "blue",
  },
  {
    title: "الدولا الرقمية في خدمتكِ",
    body: "لديكِ أسئلة؟ الدولا الرقمية متاحة 24/7 للإجابة على استفساراتكِ",
    icon: Bot,
    color: "purple",
  },
  {
    title: "تذكير بتسجيل مزاجكِ",
    body: "كيف تشعرين اليوم؟ سجّلي مزاجكِ اليومي لمتابعة حالتكِ النفسية",
    icon: Smile,
    color: "pink",
  },
  {
    title: "قائمة الوجبات الأسبوعية جاهزة",
    body: "اطّلعي على وجبات هذا الأسبوع المصممة خصيصاً لصحتكِ وصحة طفلكِ",
    icon: Salad,
    color: "emerald",
  },
];

/** إشعارات ثابتة تظهر دائماً فور فتح الصفحة دون انتظار الـAPI — محتوى عرض تعريفي فقط،
 * لا تُخزَّن في قاعدة البيانات ولا ترتبط بحالة قراءة حقيقية، بطلب صريح */
export function StaticNotifications() {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {STATIC_NOTIFICATIONS.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.title}>
            <Card className="flex h-full items-start gap-3">
              <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-full ${COLOR_CLASSES[item.color]}`}
              >
                <Icon className="size-5" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="break-words text-right font-bold text-foreground">{item.title}</p>
                <p className="mt-1 break-words text-right text-sm text-gray-600">{item.body}</p>
                <span className="mt-2 block text-end text-xs text-muted">الآن</span>
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
