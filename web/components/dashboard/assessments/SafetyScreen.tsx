"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { HandHeart, MessageCircleHeart } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiGet } from "@/lib/api-client";
import { formatArabicDateTime } from "@/lib/format";
import type { Specialist, SpecialistAvailabilitySlot } from "@/lib/types";

/**
 * شاشة السلامة — تظهر بديلًا كاملًا لشاشة النتيجة الرقمية عند تفعيل بروتوكول السلامة
 * (البند الحرج في EPDS). لا أرقام، لا لغة تشخيصية، فقط دعم هادئ ومسار واضح للمساعدة.
 */
export function SafetyScreen() {
  const psychologicalSpecialists = useQuery({
    queryKey: ["specialists", "psychological", "safety-screen"],
    queryFn: () => apiGet<Specialist[]>("specialists?track=psychological"),
  });

  const allAvailableSlots = useQuery({
    queryKey: ["available-slots", "safety-screen"],
    queryFn: () => apiGet<SpecialistAvailabilitySlot[]>("specialist-availability/available"),
  });

  const isLoading = psychologicalSpecialists.isLoading || allAvailableSlots.isLoading;
  const psychologicalIds = new Set((psychologicalSpecialists.data ?? []).map((s) => s.id));
  const nearestSlot = (allAvailableSlots.data ?? [])
    .filter((slot) => psychologicalIds.has(slot.specialistId))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

  const bookingHref = nearestSlot
    ? `/dashboard/consultations/book?track=psychological&specialistId=${nearestSlot.specialistId}`
    : "/dashboard/consultations/book?track=psychological";

  return (
    <Card className="mx-auto flex max-w-xl flex-col items-center gap-5 border-2 border-accent-200 py-10 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-accent-100 text-accent-700">
        <HandHeart className="size-8" strokeWidth={2} />
      </span>

      <div>
        <h1 className="text-xl font-extrabold text-foreground sm:text-2xl">نحن هنا من أجلك</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
          يبدو أنكِ تمرين بلحظة صعبة حقًا، وهذا أمر يستحق الاهتمام الفوري. لستِ وحدك في هذا، وما تشعرين
          به لا يعني أنكِ ضعيفة أو مقصّرة بأي شكل.
        </p>
        <p className="mt-3 max-w-md text-sm font-semibold leading-relaxed text-accent-700">
          طلب المساعدة الآن خطوة قوية وشجاعة، لا علامة ضعف.
        </p>
      </div>

      <div className="w-full max-w-sm px-1">
        {isLoading ? (
          <Skeleton className="h-14 w-full rounded-xl" />
        ) : nearestSlot ? (
          <p className="mb-3 text-sm text-muted">
            أقرب موعد متاح: <span className="font-semibold text-foreground">{formatArabicDateTime(nearestSlot.startTime)}</span>
          </p>
        ) : null}

        <Link href={bookingHref} className="block">
          <Button size="lg" className="w-full animate-gentle-breathe justify-center text-base shadow-lg shadow-primary-500/30">
            <MessageCircleHeart className="size-5" strokeWidth={2} />
            تحدثي مع أخصائية الآن
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-md rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-start">
        <p className="text-sm font-semibold leading-relaxed text-red-700">
          إن كنتِ في خطر مباشر الآن، يرجى التوجه فورًا إلى أقرب مستشفى أو الاتصال بخدمات الطوارئ المحلية.
        </p>
      </div>
    </Card>
  );
}
