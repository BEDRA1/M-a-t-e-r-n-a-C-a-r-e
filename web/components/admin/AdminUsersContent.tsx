"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  EndpointPendingNotice,
  ErrorNotice,
  FilterChips,
  StatusPill,
  TableMessageRow,
  TableSkeletonRows,
  adminInputClass,
} from "@/components/admin/AdminUi";
import { isMissingEndpoint, useAdminBookings, useAdminUsers, userBookingsCount } from "@/lib/hooks/useAdmin";
import { formatArabicDate, maskPhone, userRoleLabel } from "@/lib/format";
import type { UserRole } from "@/lib/types";

type RoleFilter = "all" | UserRole;

const ROLE_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "mother", label: "mother" },
  { value: "spouse", label: "spouse" },
  { value: "specialist", label: "specialist" },
  { value: "admin", label: "admin" },
];

const HEAD = ["الهاتف", "الدور", "تاريخ التسجيل", "الولاية", "عدد الحجوزات"];

export function AdminUsersContent() {
  const users = useAdminUsers();
  // احتياط لعدد الحجوزات إن لم يُرفقه GET /users — نحسبه من قائمة الحجوزات إن كانت متاحة
  const bookings = useAdminBookings();
  const [role, setRole] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");

  const bookingsByUser = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of bookings.data ?? []) {
      map.set(b.userId, (map.get(b.userId) ?? 0) + 1);
    }
    return map;
  }, [bookings.data]);

  const query = search.replace(/\s+/g, "");
  const rows = (users.data ?? [])
    .filter((u) => role === "all" || u.role === role)
    // البحث على الرقم الكامل، والعرض مقتطع — الإداري يعرف الرقم الذي يبحث عنه
    .filter((u) => !query || u.phone.includes(query))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const countFor = (u: (typeof rows)[number]) => userBookingsCount(u) ?? (bookings.data ? bookingsByUser.get(u.id) ?? 0 : null);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="المستخدمون"
        description={users.data ? `${users.data.length.toLocaleString("ar-DZ")} مستخدم مسجل` : "إدارة حسابات المنصة"}
      />

      <AdminPanel>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FilterChips options={ROLE_OPTIONS} value={role} onChange={setRole} />
          <label className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              inputMode="tel"
              dir="ltr"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث برقم الهاتف"
              className={`${adminInputClass} w-full pr-9 text-right sm:w-64`}
            />
          </label>
        </div>

        {isMissingEndpoint(users.error) ? (
          <EndpointPendingNotice endpoint="GET /users" />
        ) : users.error ? (
          <ErrorNotice message={users.error.message} />
        ) : (
          <AdminTable head={HEAD}>
            {users.isLoading ? (
              <TableSkeletonRows cols={HEAD.length} />
            ) : rows.length === 0 ? (
              <TableMessageRow colSpan={HEAD.length}>لا توجد نتائج مطابقة</TableMessageRow>
            ) : (
              rows.map((u) => {
                const count = countFor(u);
                return (
                  <tr key={u.id} className="hover:bg-slate-800/40">
                    <td className="px-3 py-3 font-mono tabular-nums" dir="ltr">
                      {maskPhone(u.phone)}
                    </td>
                    <td className="px-3 py-3">
                      <StatusPill tone={u.role === "admin" ? "warning" : "neutral"}>{userRoleLabel(u.role)}</StatusPill>
                    </td>
                    <td className="px-3 py-3 text-slate-300">{formatArabicDate(u.createdAt)}</td>
                    <td className="px-3 py-3 text-slate-300">{u.wilaya || "—"}</td>
                    <td className="px-3 py-3 tabular-nums">{count ?? "—"}</td>
                  </tr>
                );
              })
            )}
          </AdminTable>
        )}
      </AdminPanel>
    </div>
  );
}
