"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { BottomSheet } from "@/components/ui/BottomSheet";

export interface DateTimePickerValue {
  /** "YYYY-MM-DD" */
  date: string;
  /** "HH:mm" (24 ساعة) */
  time: string;
}

interface DateTimePickerProps {
  label?: string;
  value: DateTimePickerValue | null;
  onChange: (value: DateTimePickerValue) => void;
  /** افتراضي: اليوم */
  minDate?: Date;
  /** افتراضي: 3 أشهر من الآن */
  maxDate?: Date;
  /** قيد إضافي اختياري لتعطيل أيام معينة (مثال: أيام لا تملك فيها الأخصائية أي فتحة حقيقية) */
  isDateAvailable?: (dateStr: string) => boolean;
  /** استبدال شبكة الأوقات الافتراضية (08:00–20:00 كل 30 د) بقائمة مقيّدة ليوم معين */
  timeOptionsForDate?: (dateStr: string) => string[];
}

const WEEKDAY_LABELS = ["ح", "ن", "ث", "ر", "خ", "ج", "س"];

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function defaultTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 8; h <= 20; h++) {
    for (const m of [0, 30]) {
      if (h === 20 && m === 30) continue;
      options.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return options;
}

function periodLabel(h: number, m: number): string {
  if (h === 12 && m === 0) return "ظهراً";
  return h < 12 ? "صباحاً" : "مساءً";
}

export function formatTimeLabel(time: string): string {
  const [h, m] = time.split(":").map(Number);
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${periodLabel(h, m)}`;
}

function formatDateWithWeekday(dateStr: string): string {
  return new Intl.DateTimeFormat("ar-DZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateStr}T00:00:00`));
}

/** يحوّل قيمة المكوّن إلى ISO string جاهزة للإرسال للـBackend (نفس صيغة الحقول الحالية) */
export function dateTimeValueToIso(value: DateTimePickerValue): string {
  return new Date(`${value.date}T${value.time}:00`).toISOString();
}

function buildCalendarGrid(viewMonth: Date): (Date | null)[] {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = firstDay.getDay();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

export function DateTimePicker({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  isDateAvailable,
  timeOptionsForDate,
}: DateTimePickerProps) {
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const today = useMemo(() => startOfDay(new Date()), []);
  const effectiveMinDate = useMemo(() => startOfDay(minDate ?? today), [minDate, today]);
  const effectiveMaxDate = useMemo(() => {
    if (maxDate) return startOfDay(maxDate);
    const d = new Date(today);
    d.setMonth(d.getMonth() + 3);
    return d;
  }, [maxDate, today]);

  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const base = value ? new Date(`${value.date}T00:00:00`) : effectiveMinDate;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [draftDate, setDraftDate] = useState<string | null>(value?.date ?? null);
  const [draftTime, setDraftTime] = useState<string | null>(value?.time ?? null);
  const timeGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDraftDate(value?.date ?? null);
      setDraftTime(value?.time ?? null);
    }
  }, [isOpen, value]);

  const grid = useMemo(() => buildCalendarGrid(viewMonth), [viewMonth]);

  const canGoPrevMonth =
    new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1) >=
    new Date(effectiveMinDate.getFullYear(), effectiveMinDate.getMonth(), 1);
  const canGoNextMonth =
    new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1) <=
    new Date(effectiveMaxDate.getFullYear(), effectiveMaxDate.getMonth(), 1);

  function isDisabledDate(d: Date): boolean {
    const day = startOfDay(d);
    if (day < effectiveMinDate || day > effectiveMaxDate) return true;
    if (isDateAvailable && !isDateAvailable(toDateStr(day))) return true;
    return false;
  }

  function handleSelectDate(d: Date) {
    if (isDisabledDate(d)) return;
    const dateStr = toDateStr(d);
    setDraftDate(dateStr);
    const times = timeOptionsForDate ? timeOptionsForDate(dateStr) : defaultTimeOptions();
    if (draftTime && !times.includes(draftTime)) setDraftTime(null);
    requestAnimationFrame(() => {
      timeGridRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  function handleConfirm() {
    if (!draftDate || !draftTime) return;
    onChange({ date: draftDate, time: draftTime });
    setIsOpen(false);
  }

  const times = draftDate ? (timeOptionsForDate ? timeOptionsForDate(draftDate) : defaultTimeOptions()) : [];

  const pickerBody = (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            canGoPrevMonth && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))
          }
          disabled={!canGoPrevMonth}
          className="flex size-9 items-center justify-center rounded-full text-foreground/70 hover:bg-primary-50 disabled:opacity-30"
          aria-label="الشهر السابق"
        >
          <ChevronRight className="size-5" />
        </button>
        <span className="text-sm font-bold text-foreground">
          {new Intl.DateTimeFormat("ar-DZ", { month: "long", year: "numeric" }).format(viewMonth)}
        </span>
        <button
          type="button"
          onClick={() =>
            canGoNextMonth && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))
          }
          disabled={!canGoNextMonth}
          className="flex size-9 items-center justify-center rounded-full text-foreground/70 hover:bg-primary-50 disabled:opacity-30"
          aria-label="الشهر التالي"
        >
          <ChevronLeft className="size-5" />
        </button>
      </div>

      <div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted">
          {WEEKDAY_LABELS.map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {grid.map((d, i) => {
            if (!d) return <span key={i} />;
            const dateStr = toDateStr(d);
            const disabled = isDisabledDate(d);
            const isSelected = draftDate === dateStr;
            const isToday = toDateStr(today) === dateStr;
            return (
              <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={() => handleSelectDate(d)}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-full text-sm transition-colors",
                  disabled && "cursor-not-allowed text-gray-300",
                  !disabled && !isSelected && "text-foreground hover:bg-primary-50",
                  !disabled && isToday && !isSelected && "border border-primary-400",
                  isSelected && "bg-primary-500 font-bold text-white",
                )}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      <div ref={timeGridRef}>
        <p className="mb-2 text-sm font-medium text-foreground">الوقت</p>
        {!draftDate ? (
          <p className="text-sm text-muted">اختاري تاريخًا أولًا لعرض الأوقات المتاحة</p>
        ) : times.length === 0 ? (
          <p className="text-sm text-muted">لا توجد أوقات متاحة في هذا اليوم</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {times.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setDraftTime(t)}
                className={cn(
                  "rounded-xl border px-2 py-2 text-xs font-medium transition-colors",
                  draftTime === t
                    ? "border-primary-500 bg-primary-500 text-white"
                    : "border-black/10 bg-white text-foreground hover:border-primary-300",
                )}
              >
                {formatTimeLabel(t)}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={!draftDate || !draftTime}
        onClick={handleConfirm}
        className="w-full rounded-full bg-primary-500 py-3 text-sm font-semibold text-white disabled:opacity-40"
      >
        تأكيد الموعد
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-2.5 rounded-xl border border-black/10 bg-surface px-4 py-3 text-start text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300"
      >
        <CalendarDays className="size-4 shrink-0 text-primary-500" />
        {value ? (
          <span className="text-foreground">
            {formatDateWithWeekday(value.date)} — {formatTimeLabel(value.time)}
          </span>
        ) : (
          <span className="text-muted">اختاري التاريخ والوقت</span>
        )}
      </button>

      {value && (
        <p className="text-xs font-medium text-primary-700">
          موعدك: {formatDateWithWeekday(value.date)}، الساعة {formatTimeLabel(value.time)}
        </p>
      )}

      {isDesktop ? (
        isOpen && (
          <div className="mt-1 rounded-2xl border border-black/10 bg-surface p-4 shadow-lg">{pickerBody}</div>
        )
      ) : (
        <BottomSheet open={isOpen} onClose={() => setIsOpen(false)} title="اختيار الموعد">
          {pickerBody}
        </BottomSheet>
      )}
    </div>
  );
}
