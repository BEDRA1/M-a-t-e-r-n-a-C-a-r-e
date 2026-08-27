"use client";

import Link from "next/link";
import { Calendar, LayoutDashboard, Lock, Mail, MapPin, Phone, UserRound, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { PageSpinner } from "@/components/ui/Spinner";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { ApiError } from "@/lib/api-client";
import { formatArabicDate, userRoleLabel } from "@/lib/format";
import { ProfileEditForm } from "./ProfileEditForm";
import { ChangePasswordForm } from "./ChangePasswordForm";

export function ProfileContent() {
  const currentUser = useCurrentUser();

  if (currentUser.isLoading) {
    return <PageSpinner />;
  }

  if (currentUser.isError || !currentUser.data) {
    return (
      <Alert tone="error">
        {currentUser.error instanceof ApiError ? currentUser.error.message : "تعذّر تحميل بيانات ملفك الشخصي"}
      </Alert>
    );
  }

  const user = currentUser.data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">ملفي الشخصي</h1>
        <p className="mt-1 text-sm text-muted">بيانات حسابك وإعدادات الأمان الخاصة بك.</p>
      </div>

      <Card>
        <div className="flex items-center gap-3">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <UserRound className="size-6" strokeWidth={2} />
          </span>
          <div>
            <p className="font-extrabold text-foreground">{user.phone}</p>
            <Badge tone="primary">{userRoleLabel(user.role)}</Badge>
          </div>
        </div>

        <div className="mt-5 grid gap-3 border-t border-black/5 pt-5 sm:grid-cols-2">
          <span className="flex items-center gap-2 text-sm text-muted">
            <Phone className="size-4" strokeWidth={2} />
            {user.phone} (معرّف الحساب، غير قابل للتعديل)
          </span>
          <span className="flex items-center gap-2 text-sm text-muted">
            <Mail className="size-4" strokeWidth={2} />
            {user.email ?? "لم يُضَف بريد إلكتروني بعد"}
          </span>
          <span className="flex items-center gap-2 text-sm text-muted">
            <MapPin className="size-4" strokeWidth={2} />
            {user.wilaya ?? "لم تُحدَّد الولاية بعد"}
          </span>
          <span className="flex items-center gap-2 text-sm text-muted">
            <Calendar className="size-4" strokeWidth={2} />
            عضوة منذ {formatArabicDate(user.createdAt)}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-black/5 pt-5">
          <Link href="/dashboard/family">
            <Button variant="outline" size="sm">
              <Users className="size-4" strokeWidth={2} />
              إدارة ربط العائلة
            </Button>
          </Link>
          {user.role === "specialist" && (
            <Link href="/dashboard/consultations/specialist-panel">
              <Button variant="outline" size="sm">
                <LayoutDashboard className="size-4" strokeWidth={2} />
                لوحة الأخصائي
              </Button>
            </Link>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-foreground">تعديل البيانات</h2>
        <div className="mt-4">
          <ProfileEditForm user={user} />
        </div>
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Lock className="size-5" strokeWidth={2} />
          تغيير كلمة المرور
        </h2>
        <div className="mt-4">
          <ChangePasswordForm />
        </div>
      </Card>
    </div>
  );
}
