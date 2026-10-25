"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiError, apiGet } from "../api-client";
import type { Booking, User, UserSubscription } from "../types";

// شكل المستخدم كما نتوقعه من GET /users للإدارة — عدد الحجوزات اختياري لأن الـBackend
// قد يُعيده كـ_count (Prisma) أو كحقل مسطّح، أو لا يُعيده إطلاقًا
export interface AdminUser extends User {
  _count?: { bookingsMade?: number };
  bookingsCount?: number;
}

export interface AdminBooking extends Booking {
  user?: { id: string; phone: string };
}

export interface AdminSubscription extends UserSubscription {
  user?: { id: string; phone: string };
}

/** الـBackend قد يُعيد مصفوفة مباشرة أو صفحة {items} — نوحّد الشكل هنا مرة واحدة */
function toList<T>(data: T[] | { items?: T[] } | null): T[] {
  if (Array.isArray(data)) return data;
  return data?.items ?? [];
}

/** 404/405 تعني أن الـendpoint غير موجود بعد في الـBackend (لا خطأ صلاحيات ولا عطل) */
export function isMissingEndpoint(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 404 || error.status === 405);
}

function adminListQuery<T>(key: string, path: string) {
  return {
    queryKey: ["admin", key],
    queryFn: async () => toList(await apiGet<T[] | { items?: T[] }>(path)),
    // لا فائدة من إعادة المحاولة على endpoint غير موجود
    retry: (count: number, error: Error) => !isMissingEndpoint(error) && count < 2,
  };
}

// GET /users (admin فقط) — src/users: id/phone/role/wilaya/createdAt + _count.bookingsMade، بفلتر ?role= اختياري
export function useAdminUsers() {
  return useQuery(adminListQuery<AdminUser>("users", "users"));
}

// GET /bookings (admin فقط) — مع user.phone وspecialist.fullName وavailabilitySlot.startTime، بفلتر ?status= اختياري
export function useAdminBookings() {
  return useQuery(adminListQuery<AdminBooking>("bookings", "bookings"));
}

// GET /subscriptions (admin فقط) — مع user.phone وplan وtransactions، بفلتر ?status= اختياري
export function useAdminSubscriptions() {
  return useQuery(adminListQuery<AdminSubscription>("subscriptions", "subscriptions"));
}

/** مبلغ الاشتراك المدفوع فعليًا: مجموع المعاملات الناجحة إن وُجدت، وإلا سعر الباقة */
export function subscriptionAmount(sub: AdminSubscription): number {
  const succeeded = sub.transactions?.filter((t) => t.status === "succeeded") ?? [];
  if (succeeded.length > 0) {
    return succeeded.reduce((sum, t) => sum + t.amount, 0);
  }
  return sub.plan?.price ?? 0;
}

export function userBookingsCount(user: AdminUser): number | null {
  return user._count?.bookingsMade ?? user.bookingsCount ?? null;
}
