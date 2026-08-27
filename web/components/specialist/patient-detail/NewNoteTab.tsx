"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useBookingsForSpecialist } from "@/lib/hooks/useBookings";
import { useCreateClinicalNote } from "@/lib/hooks/useClinicalNotes";
import { consultationTypeLabel, formatArabicDateTime } from "@/lib/format";
import { ApiError } from "@/lib/api-client";

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function NewNoteTab({ patientUserId }: { patientUserId: string }) {
  const bookings = useBookingsForSpecialist();
  const createNote = useCreateClinicalNote(patientUserId);

  const patientBookings = (bookings.data ?? [])
    .filter((b) => b.userId === patientUserId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const [bookingId, setBookingId] = useState("");
  const [noteText, setNoteText] = useState("");
  const [sessionDate, setSessionDate] = useState(todayIsoDate());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId || !noteText.trim()) return;
    createNote.mutate(
      { bookingId, noteText: noteText.trim(), sessionDate },
      {
        onSuccess: () => {
          setNoteText("");
        },
      },
    );
  };

  if (patientBookings.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-400">لا توجد جلسات مسجّلة مع هذه المريضة بعد.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4">
      {createNote.isError && (
        <Alert tone="error">
          {createNote.error instanceof ApiError ? createNote.error.message : "تعذّر حفظ الملاحظة"}
        </Alert>
      )}
      {createNote.isSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="size-4" strokeWidth={2} />
          تم حفظ الملاحظة بنجاح
        </div>
      )}

      <Select label="الجلسة المرتبطة" value={bookingId} onChange={(e) => setBookingId(e.target.value)} required>
        <option value="">اختاري جلسة</option>
        {patientBookings.map((b) => (
          <option key={b.id} value={b.id}>
            {b.availabilitySlot ? formatArabicDateTime(b.availabilitySlot.startTime) : ""} ·{" "}
            {consultationTypeLabel(b.consultationType)}
          </option>
        ))}
      </Select>

      <Input
        type="date"
        label="تاريخ الجلسة"
        value={sessionDate}
        onChange={(e) => setSessionDate(e.target.value)}
        required
        className="focus:border-blue-400 focus:ring-blue-300"
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">نص الملاحظة</label>
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={6}
          placeholder="ملاحظات كلينيكية عن سير الجلسة، التقدّم، والتوصيات..."
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          required
        />
        <p className="text-xs text-slate-400">هذه الملاحظة سرّية ولا تظهر للمريضة إطلاقًا.</p>
      </div>

      <Button
        type="submit"
        loading={createNote.isPending}
        disabled={!bookingId || !noteText.trim()}
        variant="ghost"
        className="self-start bg-blue-600 text-white hover:bg-blue-700"
      >
        حفظ الملاحظة
      </Button>
    </form>
  );
}
