"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Globe, Languages, LogOut, MessageSquareHeart, Shield, UserRound } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useLogout } from "@/lib/hooks/useAuth";
import { notificationTypeLabel } from "@/lib/format";
import { TestimonialForm } from "./TestimonialForm";
import { DataPrivacySection } from "./DataPrivacySection";
import type { NotificationType } from "@/lib/types";

const SENT_NOTIFICATION_TYPES: NotificationType[] = [
  "appointment_reminder",
  "booking_confirmed",
  "general",
  "vaccination_reminder",
  "daily_tip",
];

export function SettingsContent() {
  const logout = useLogout();
  const router = useRouter();

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">الإعدادات</h1>
        <p className="mt-1 text-sm text-muted">إدارة حسابك وتفضيلاتك في التطبيق.</p>
      </div>

      <Card>
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Bell className="size-5 text-primary-600" strokeWidth={2} />
          الإشعارات
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          لا توجد حاليًا خيارات لتخصيص الإشعارات، لكن النظام يرسل تلقائيًا الأنواع التالية إلى صفحة الإشعارات
          الخاصة بك:
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SENT_NOTIFICATION_TYPES.map((type) => (
            <Badge key={type} tone="neutral">
              {notificationTypeLabel(type)}
            </Badge>
          ))}
        </div>
        <Link
          href="/dashboard/notifications"
          className="mt-4 inline-flex text-sm font-semibold text-primary-600 hover:underline"
        >
          الانتقال إلى صفحة الإشعارات
        </Link>
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <UserRound className="size-5 text-primary-600" strokeWidth={2} />
          الحساب
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/dashboard/profile">
            <Button variant="outline" size="sm">
              ملفي الشخصي
            </Button>
          </Link>
          <Button variant="danger" size="sm" onClick={handleLogout} loading={logout.isPending}>
            <LogOut className="size-4" strokeWidth={2} />
            تسجيل الخروج
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Shield className="size-5 text-primary-600" strokeWidth={2} />
          الخصوصية
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          نستخدم بياناتك (مثل معلومات الحمل والصحة التي تُدخلينها) فقط لتقديم خدمات التطبيق لكِ شخصيًا — كالتذكيرات
          والمتابعة الأسبوعية وربط الحجوزات بحسابك. لا تُشارَك بياناتك مع أطراف خارجية دون علمك.
        </p>
      </Card>

      <DataPrivacySection />

      <Card>
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Languages className="size-5 text-primary-600" strokeWidth={2} />
          اللغة
        </h2>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted">
          <Globe className="size-4" strokeWidth={2} />
          التطبيق متاح حاليًا باللغة العربية فقط.
        </p>
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <MessageSquareHeart className="size-5 text-primary-600" strokeWidth={2} />
          شاركينا رأيك
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          تجربتك تساعد أمهات أخريات — رأيك سيُنشر في صفحة الهبوط بعد مراجعته من فريق التطبيق.
        </p>
        <div className="mt-4">
          <TestimonialForm />
        </div>
      </Card>
    </div>
  );
}
