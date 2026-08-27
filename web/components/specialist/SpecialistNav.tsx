"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarClock, GraduationCap, LayoutDashboard, LogOut, Menu, Stethoscope, Users, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { useLogout } from "@/lib/hooks/useAuth";
import { isNavPathActive } from "@/components/dashboard/nav-links";
import type { User } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/specialist", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/specialist/bookings", label: "حجوزاتي", icon: CalendarClock },
  { href: "/specialist/patients", label: "مريضاتي", icon: Users },
  { href: "/dashboard/consultations/specialist-panel", label: "دوراتي", icon: GraduationCap },
];

export function SpecialistNav({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/specialist" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Stethoscope className="size-5" strokeWidth={2.25} />
          </span>
          <span className="font-extrabold text-slate-800">لوحة الأخصائي</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isNavPathActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                  active ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
                )}
              >
                <item.icon className="size-4" strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <span className="text-sm text-slate-500">{user.phone}</span>
          <Button variant="outline" size="sm" onClick={handleLogout} loading={logout.isPending}>
            <LogOut className="size-4" strokeWidth={2} />
            تسجيل الخروج
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex size-10 items-center justify-center rounded-lg text-slate-600 md:hidden"
          aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isNavPathActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                    active ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-blue-50",
                  )}
                >
                  <item.icon className="size-4" strokeWidth={2} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="text-sm text-slate-500">{user.phone}</span>
            <Button variant="outline" size="sm" onClick={handleLogout} loading={logout.isPending}>
              <LogOut className="size-4" strokeWidth={2} />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
