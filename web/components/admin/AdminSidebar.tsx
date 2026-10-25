"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Calendar, CreditCard, LayoutDashboard, LogOut, Menu, ShieldCheck, Users, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLogout } from "@/lib/hooks/useAuth";
import type { User } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/users", label: "المستخدمون", icon: Users },
  { href: "/admin/bookings", label: "الحجوزات", icon: Calendar },
  { href: "/admin/subscriptions", label: "الاشتراكات", icon: CreditCard },
];

function isActive(pathname: string, href: string): boolean {
  // "/admin" يطابق نفسه فقط، وإلا سيبقى نشطًا في كل الصفحات الفرعية
  return href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/** العودة للموقع حسب الدور — الأدمن يستخدم /dashboard (حيث سجل النشاط الإداري) */
function siteHomeFor(user: User): string {
  return user.role === "specialist" ? "/specialist" : "/dashboard";
}

function SidebarBody({ user, onNavigate }: { user: User; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-700/60 px-5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
          <ShieldCheck className="size-5" strokeWidth={2.25} />
        </span>
        <div className="leading-tight">
          <p className="font-extrabold text-white">Materna Care</p>
          <p className="text-xs text-slate-400">لوحة الإدارة</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active ? "bg-slate-100 text-slate-900" : "text-slate-300 hover:bg-slate-700/50 hover:text-white",
              )}
            >
              <item.icon className="size-[18px]" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}

        <div className="my-3 border-t border-slate-700/60" />

        <Link
          href={siteHomeFor(user)}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
        >
          <ArrowRight className="size-[18px]" strokeWidth={2} />
          العودة للموقع
        </Link>
      </nav>

      <div className="border-t border-slate-700/60 p-3">
        <button
          type="button"
          onClick={handleLogout}
          disabled={logout.isPending}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-60"
        >
          <LogOut className="size-[18px]" strokeWidth={2} />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar({ user }: { user: User }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-l border-slate-700/60 bg-[#1E293B] lg:block">
      <SidebarBody user={user} />
    </aside>
  );
}

export function AdminHeader({ user }: { user: User }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-700/60 bg-[#0F172A]/90 px-4 backdrop-blur sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex size-10 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 lg:hidden"
          aria-label="فتح القائمة"
        >
          <Menu className="size-5" />
        </button>
        <p className="hidden text-sm text-slate-400 lg:block">مرحبًا بك في لوحة إدارة المنصة</p>
        <div className="flex items-center gap-2.5">
          <span dir="ltr" className="text-sm tabular-nums text-slate-300">
            {user.phone}
          </span>
          <span className="rounded-full bg-slate-700/70 px-2.5 py-0.5 text-xs font-semibold text-slate-200">admin</span>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-label="إغلاق القائمة"
          />
          <aside className="absolute inset-y-0 right-0 w-72 max-w-[85vw] bg-[#1E293B] shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute left-3 top-3 flex size-10 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-700"
              aria-label="إغلاق القائمة"
            >
              <X className="size-5" />
            </button>
            <SidebarBody user={user} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
