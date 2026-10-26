"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiGet, apiPatch, apiPost } from "../api-client";
import type {
  AdminTestimonial,
  Booking,
  BookingStatus,
  ConsultationType,
  MealOrderStatus,
  PaymentStatus,
  ProductOrderStatus,
  ServiceBookingStatus,
  SpecialistStatus,
  SpecialistTrack,
  SubscriptionPaymentMethod,
  SubscriptionStatus,
  TransactionStatus,
  UserRole,
  MealOrder,
  ProductOrder,
  ServiceBooking,
  Specialist,
  UrgentHelpRequest,
  UrgentHelpStatus,
  User,
  UserSubscription,
} from "../types";

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

// ── طلبات المساعدة العاجلة ──────────────────────────────────────────────────

const URGENT_POLL_MS = 30_000;

/** عدد المفتوحة فقط (بلا بيانات شخصية) — للتنبيه الأحمر وشارة الـsidebar في كل صفحات /admin */
export function useUrgentOpenCount() {
  return useQuery({
    queryKey: ["admin", "urgent-help", "open-count"],
    queryFn: () => apiGet<{ open: number }>("urgent-help-requests/open-count"),
    refetchInterval: URGENT_POLL_MS,
  });
}

export function useAdminUrgentHelp() {
  return useQuery({
    queryKey: ["admin", "urgent-help", "list"],
    queryFn: () => apiGet<UrgentHelpRequest[]>("urgent-help-requests"),
    refetchInterval: URGENT_POLL_MS,
  });
}

// يُسجَّل في سجل النشاط تلقائيًا (@AuditLog('update_urgent_help_status') على الـendpoint).
// notes لا تُرسَل عمدًا: الـBackend يكتب فوق ملاحظة الأم إن أُرسلت
export function useSetUrgentHelpStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UrgentHelpStatus }) =>
      apiPatch<UrgentHelpRequest>(`urgent-help-requests/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "urgent-help"] });
      queryClient.invalidateQueries({ queryKey: ["urgent-help-requests"] });
    },
  });
}

// ── الأخصائيات ──────────────────────────────────────────────────────────────

export interface AdminSpecialist extends Specialist {
  user?: { id: string; phone: string; wilaya: string | null };
}

export function useAdminSpecialists() {
  return useQuery({
    queryKey: ["admin", "specialists"],
    queryFn: () => apiGet<AdminSpecialist[]>("admin/specialists"),
  });
}

export function useReviewSpecialist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: "approve" | "reject" }) =>
      apiPatch<Specialist>(`specialists/${id}/${decision}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "specialists"] });
      // قائمة الأخصائيات العامة تتغيّر أيضًا بالاعتماد/الرفض
      queryClient.invalidateQueries({ queryKey: ["specialists"] });
    },
  });
}

// ── آراء المستخدمات ─────────────────────────────────────────────────────────

export function useAdminTestimonials() {
  return useQuery({
    queryKey: ["admin", "testimonials"],
    queryFn: () => apiGet<AdminTestimonial[]>("admin/testimonials"),
  });
}

export function useReviewTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: "approve" | "reject" }) =>
      apiPatch<AdminTestimonial>(`admin/testimonials/${id}/${decision}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });
}

// ── الطلبات: الوجبات، المتجر، الخدمات المنزلية ──────────────────────────────

type OrderOwner = { user?: { id: string; phone: string } };
export type AdminMealOrder = MealOrder & OrderOwner;
export type AdminProductOrder = ProductOrder & OrderOwner;
export type AdminServiceBooking = ServiceBooking & OrderOwner;

export type OrderKind = "meal-orders" | "product-orders" | "service-bookings";

export function useAdminMealOrders() {
  return useQuery(adminListQuery<AdminMealOrder>("meal-orders", "meal-orders"));
}

export function useAdminProductOrders() {
  return useQuery(adminListQuery<AdminProductOrder>("product-orders", "product-orders"));
}

export function useAdminServiceBookings() {
  return useQuery(adminListQuery<AdminServiceBooking>("service-bookings", "service-bookings"));
}

export interface AdminOrderCounts {
  mealOrders: number;
  productOrders: number;
  serviceBookings: number;
  total: number;
}

/** عدد الطلبات الجديدة (pending) لكل نوع — لشارات الـsidebar وبطاقة الصفحة الرئيسية */
export function useAdminOrderCounts() {
  return useQuery({
    queryKey: ["admin", "order-counts"],
    queryFn: () => apiGet<AdminOrderCounts>("admin/order-counts"),
    refetchInterval: 60_000,
  });
}

// يمر عبر PATCH /:id/status الموجود لكل نوع (admin فقط + @AuditLog) — قواعد الانتقال تُفرض في الـBackend،
// وإلغاء طلب متجر يُعيد المخزون هناك (restoreStockAndCancel)
export function useSetOrderStatus(kind: OrderKind) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiPatch<{ id: string }>(`${kind}/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", kind] });
      queryClient.invalidateQueries({ queryKey: ["admin", "order-counts"] });
    },
  });
}

// PATCH status=cancelled لا POST /cancel: الأول مسجَّل في سجل النشاط (update_booking_status) والثاني لا،
// وكلاهما يحرّر فتحة الأخصائية عبر releaseSlotAndCancel
export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPatch<Booking>(`bookings/${id}/status`, { status: "cancelled" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    },
  });
}

// ── إدارة المستخدمين ────────────────────────────────────────────────────────

/** تفاصيل مستخدم كما يُرجعها GET /users/:id — بلا أي بيانات طبية (تقييمات، مزاج، ملاحظات كلينيكية) */
export interface AdminUserDetails extends User {
  isActive: boolean;
  specialistProfile: {
    id: string;
    fullName: string;
    specialty: string;
    track: SpecialistTrack;
    status: SpecialistStatus;
    yearsExperience: number;
  } | null;
  bookingsMade: {
    id: string;
    status: BookingStatus;
    consultationType: ConsultationType;
    paymentStatus: PaymentStatus;
    createdAt: string;
    specialist: { id: string; fullName: string };
    availabilitySlot: { startTime: string };
  }[];
  subscriptions: {
    id: string;
    status: SubscriptionStatus;
    startedAt: string;
    expiresAt: string | null;
    bookingCreditsRemaining: number;
    courseCreditsRemaining: number;
    plan: { id: string; code: string; nameAr: string; price: number };
    transactions: { id: string; amount: number; paymentMethod: SubscriptionPaymentMethod; status: TransactionStatus; createdAt: string }[];
  }[];
  mealOrders: { id: string; status: MealOrderStatus; totalPrice: number; preferredTime: string; createdAt: string }[];
  productOrders: { id: string; status: ProductOrderStatus; totalPrice: number; createdAt: string }[];
  serviceBookings: { id: string; status: ServiceBookingStatus; scheduledTime: string; createdAt: string; service: { name: string } }[];
}

export function useAdminUserDetails(id: string) {
  return useQuery({
    queryKey: ["admin", "users", id],
    queryFn: () => apiGet<AdminUserDetails>(`users/${id}`),
  });
}

function useInvalidateUser() {
  const queryClient = useQueryClient();
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    if (id) queryClient.invalidateQueries({ queryKey: ["admin", "users", id] });
  };
}

export function useSetUserActive() {
  const invalidate = useInvalidateUser();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => apiPatch<User>(`users/${id}/active`, { isActive }),
    onSuccess: (_data, vars) => invalidate(vars.id),
  });
}

export function useChangeUserRole() {
  const invalidate = useInvalidateUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => apiPatch<User>(`users/${id}/role`, { role }),
    onSuccess: (_data, vars) => {
      invalidate(vars.id);
      // خفض أخصائية لدور آخر يرفض ملفها تلقائيًا في الـBackend
      queryClient.invalidateQueries({ queryKey: ["admin", "specialists"] });
    },
  });
}

export interface CreateSpecialistAccountInput {
  fullName: string;
  phone: string;
  specialty: string;
  track: SpecialistTrack;
  wilaya?: string;
  password: string;
}

export function useCreateSpecialistAccount() {
  const invalidate = useInvalidateUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSpecialistAccountInput) => apiPost<User>("users/specialists", input),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["admin", "specialists"] });
    },
  });
}

export function useGrantSubscription() {
  const invalidate = useInvalidateUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { userId: string; planCode: string; reference?: string }) =>
      apiPost<UserSubscription>("subscriptions/grant", input),
    onSuccess: (_data, vars) => {
      invalidate(vars.userId);
      queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
    },
  });
}
