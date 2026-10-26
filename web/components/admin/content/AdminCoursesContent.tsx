"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { AdminButton, AdminPageHeader, AdminPanel, ErrorNotice, FilterChips, StatusPill, adminInputClass } from "@/components/admin/AdminUi";
import { EditorModal, Field, ImageUrlField, ListSkeleton, Thumb, adminTextareaClass, urlOrNull } from "./ContentUi";
import { AdminCourses, type AdminCourse } from "@/lib/hooks/useAdminContent";
import { consultationTypeLabel, formatArabicDateTime, formatDzd } from "@/lib/format";

type Filter = "upcoming" | "past" | "all";

/** ISO ↔ قيمة input[type=datetime-local] بالتوقيت المحلي للمتصفح */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface CourseForm {
  title: string;
  description: string;
  imageUrl: string;
  capacity: number | "";
  startDate: string;
}

export function AdminCoursesContent() {
  const courses = AdminCourses.useList();
  const update = AdminCourses.useUpdate();

  const [filter, setFilter] = useState<Filter>("upcoming");
  const [editing, setEditing] = useState<AdminCourse | null>(null);
  const [form, setForm] = useState<CourseForm>({ title: "", description: "", imageUrl: "", capacity: "", startDate: "" });

  const [now] = useState(() => Date.now());
  const all = courses.data ?? [];
  const isUpcoming = (c: AdminCourse) => new Date(c.startDate).getTime() >= now;
  const rows = all.filter((c) => (filter === "all" ? true : filter === "upcoming" ? isUpcoming(c) : !isUpcoming(c)));

  const openEditor = (course: AdminCourse) => {
    update.reset();
    setEditing(course);
    setForm({
      title: course.title,
      description: course.description,
      imageUrl: course.imageUrl ?? "",
      capacity: course.capacity ?? "",
      startDate: toLocalInput(course.startDate),
    });
  };

  const save = () => {
    if (!editing) return;
    update.mutate(
      {
        id: editing.id,
        title: form.title,
        description: form.description,
        imageUrl: urlOrNull(form.imageUrl),
        startDate: new Date(form.startDate).toISOString(),
        ...(editing.type === "in_person" && form.capacity !== "" ? { capacity: form.capacity } : {}),
      },
      { onSuccess: () => setEditing(null) },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="الدورات"
        description="تعديل العنوان والوصف والصورة والسعة والموعد. النوع والسعر لا يتغيّران من هنا — السعر يُحدَّد من صفحة الأسعار للدورات الجديدة"
      />

      <FilterChips
        value={filter}
        onChange={setFilter}
        options={[
          { value: "upcoming", label: `القادمة (${all.filter(isUpcoming).length})` },
          { value: "past", label: `السابقة (${all.filter((c) => !isUpcoming(c)).length})` },
          { value: "all", label: `الكل (${all.length})` },
        ]}
      />

      {courses.error ? (
        <ErrorNotice message={courses.error.message} />
      ) : courses.isLoading ? (
        <ListSkeleton />
      ) : (
        <AdminPanel className="!p-0">
          {rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">لا توجد دورات</p>
          ) : (
            <ul className="divide-y divide-slate-700/60">
              {rows.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <Thumb src={c.imageUrl} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-100">{c.title}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {c.specialist?.fullName ?? "—"} · {formatArabicDateTime(c.startDate)}
                    </p>
                  </div>
                  <StatusPill tone="neutral">{consultationTypeLabel(c.type)}</StatusPill>
                  <span className="text-xs tabular-nums text-slate-300">
                    {c.type === "in_person" && c.capacity !== null ? `${c.enrolledCount}/${c.capacity} مقعد` : `${c.enrolledCount} مسجّلة`}
                  </span>
                  <span className="text-sm tabular-nums text-emerald-400">{formatDzd(c.price)}</span>
                  <AdminButton onClick={() => openEditor(c)}>
                    <Pencil className="size-3.5" />
                    تعديل
                  </AdminButton>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      )}

      <EditorModal
        open={editing !== null}
        title="تعديل الدورة"
        error={update.error?.message}
        saving={update.isPending}
        onClose={() => setEditing(null)}
        onSubmit={save}
      >
        <Field label="العنوان">
          <input required minLength={3} maxLength={150} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={`${adminInputClass} w-full`} />
        </Field>
        <Field label="الوصف">
          <textarea
            required
            minLength={10}
            maxLength={3000}
            rows={5}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className={adminTextareaClass}
          />
        </Field>
        <ImageUrlField label="صورة الدورة" value={form.imageUrl} onChange={(v) => setForm((f) => ({ ...f, imageUrl: v }))} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="موعد البدء">
            <input
              required
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              className={`${adminInputClass} w-full`}
            />
          </Field>
          {editing?.type === "in_person" ? (
            <Field label="السعة (مقاعد)" hint={`لا تقل عن عدد المسجّلات حاليًا (${editing.enrolledCount})`}>
              <input
                type="number"
                min={Math.max(1, editing.enrolledCount)}
                max={1000}
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value ? Number(e.target.value) : "" }))}
                className={`${adminInputClass} w-full`}
              />
            </Field>
          ) : (
            <Field label="السعة">
              <p className="py-2 text-xs text-slate-500">الدورات عن بُعد بلا حد للمقاعد</p>
            </Field>
          )}
        </div>
      </EditorModal>
    </div>
  );
}
