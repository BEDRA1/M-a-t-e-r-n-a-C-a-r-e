"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { AdminButton, AdminPageHeader, AdminPanel, ErrorNotice, adminInputClass } from "@/components/admin/AdminUi";
import { EditorModal, Field, ImageUrlField, ListSkeleton, Thumb, VisibilityButton, VisibilityPill, adminTextareaClass, urlOrNull } from "./ContentUi";
import { AdminMeals, type AdminWeeklyMeal, type MealInput } from "@/lib/hooks/useAdminContent";
import { dayOfWeekLabel, formatDzd, mealTypeLabel } from "@/lib/format";
import type { MealType } from "@/lib/types";

const DAYS = [0, 1, 2, 3, 4, 5, 6];
const EMPTY: MealInput & { imageUrl: string } = { dayOfWeek: 0, mealType: "lunch", name: "", description: "", price: 0, imageUrl: "" };

export function AdminMealsContent() {
  const meals = AdminMeals.useList();
  const create = AdminMeals.useCreate();
  const update = AdminMeals.useUpdate();

  const [editing, setEditing] = useState<AdminWeeklyMeal | "new" | null>(null);
  const [form, setForm] = useState(EMPTY);
  const mutation = editing === "new" ? create : update;
  const togglingId = update.isPending && update.variables?.isActive !== undefined ? update.variables.id : null;

  const openEditor = (meal: AdminWeeklyMeal | "new") => {
    create.reset();
    update.reset();
    setEditing(meal);
    setForm(
      meal === "new"
        ? EMPTY
        : { dayOfWeek: meal.dayOfWeek, mealType: meal.mealType, name: meal.name, description: meal.description, price: meal.price, imageUrl: meal.imageUrl ?? "" },
    );
  };

  const save = () => {
    const input = { ...form, imageUrl: urlOrNull(form.imageUrl) };
    const done = { onSuccess: () => setEditing(null) };
    if (editing === "new") create.mutate(input, done);
    else if (editing) update.mutate({ id: editing.id, ...input }, done);
  };

  const byDay = DAYS.map((d) => ({ day: d, meals: (meals.data ?? []).filter((m) => m.dayOfWeek === d) })).filter((g) => g.meals.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <AdminPageHeader
          title="قائمة الوجبات"
          description="الوجبة المخفية تختفي من قائمة الأسبوع ولا يمكن طلبها، وطلباتها السابقة تبقى كما هي"
        />
        <AdminButton tone="positive" className="h-9" onClick={() => openEditor("new")}>
          <Plus className="size-4" />
          وجبة جديدة
        </AdminButton>
      </div>

      {update.error && editing === null && <ErrorNotice message={update.error.message} />}

      {meals.error ? (
        <ErrorNotice message={meals.error.message} />
      ) : meals.isLoading ? (
        <ListSkeleton />
      ) : byDay.length === 0 ? (
        <AdminPanel>
          <p className="py-8 text-center text-sm text-slate-500">لا توجد وجبات</p>
        </AdminPanel>
      ) : (
        byDay.map((g) => (
          <AdminPanel key={g.day} className="!p-0">
            <h2 className="border-b border-slate-700/60 px-4 py-3 text-sm font-bold text-slate-200">{dayOfWeekLabel(g.day)}</h2>
            <ul className="divide-y divide-slate-700/60">
              {g.meals.map((m) => (
                <li key={m.id} className={`flex flex-wrap items-center gap-3 px-4 py-3 ${m.isActive ? "" : "opacity-60"}`}>
                  <Thumb src={m.imageUrl} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-100">
                      <span className="me-2 text-xs font-medium text-slate-400">{mealTypeLabel(m.mealType)}</span>
                      {m.name}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{m.description}</p>
                  </div>
                  <span className="text-sm tabular-nums text-emerald-400">{formatDzd(m.price)}</span>
                  <VisibilityPill active={m.isActive} />
                  <div className="flex gap-1.5">
                    <AdminButton onClick={() => openEditor(m)}>
                      <Pencil className="size-3.5" />
                      تعديل
                    </AdminButton>
                    <VisibilityButton active={m.isActive} busy={togglingId === m.id} onToggle={() => update.mutate({ id: m.id, isActive: !m.isActive })} />
                  </div>
                </li>
              ))}
            </ul>
          </AdminPanel>
        ))
      )}

      <EditorModal
        open={editing !== null}
        title={editing === "new" ? "وجبة جديدة" : "تعديل الوجبة"}
        error={mutation.error?.message}
        saving={mutation.isPending}
        onClose={() => setEditing(null)}
        onSubmit={save}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="اليوم">
            <select value={form.dayOfWeek} onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: Number(e.target.value) }))} className={`${adminInputClass} w-full`}>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {dayOfWeekLabel(d)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="الوجبة">
            <select value={form.mealType} onChange={(e) => setForm((f) => ({ ...f, mealType: e.target.value as MealType }))} className={`${adminInputClass} w-full`}>
              <option value="lunch">{mealTypeLabel("lunch")}</option>
              <option value="dinner">{mealTypeLabel("dinner")}</option>
            </select>
          </Field>
        </div>
        <Field label="الاسم">
          <input required minLength={2} maxLength={200} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={`${adminInputClass} w-full`} />
        </Field>
        <Field label="المكونات / الوصف">
          <textarea required minLength={5} rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={adminTextareaClass} />
        </Field>
        <Field label="السعر (دج)" hint="يُطبَّق على الطلبات الجديدة فقط — الطلبات السابقة تحتفظ بسعرها">
          <input
            required
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
            className={`${adminInputClass} w-36`}
          />
        </Field>
        <ImageUrlField value={form.imageUrl} onChange={(v) => setForm((f) => ({ ...f, imageUrl: v }))} />
      </EditorModal>
    </div>
  );
}
