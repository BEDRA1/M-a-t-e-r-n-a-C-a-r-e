"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { AdminButton, AdminPageHeader, AdminPanel, ErrorNotice, FilterChips, adminInputClass } from "@/components/admin/AdminUi";
import { EditorModal, Field, ListSkeleton, VisibilityButton, VisibilityPill, adminTextareaClass } from "./ContentUi";
import { AdminFaq, useFaqCategories, type AdminFaqEntry, type FaqInput } from "@/lib/hooks/useAdminContent";

export function AdminFaqContent() {
  const entries = AdminFaq.useList();
  const categories = useFaqCategories();
  const create = AdminFaq.useCreate();
  const update = AdminFaq.useUpdate();

  const [categoryId, setCategoryId] = useState<string>("");
  const [editing, setEditing] = useState<AdminFaqEntry | "new" | null>(null);
  const [form, setForm] = useState<FaqInput>({ categoryId: "", questionAr: "", answerAr: "" });

  const cats = categories.data ?? [];
  const activeCategory = categoryId || cats[0]?.id || "";
  const all = entries.data ?? [];
  const rows = all.filter((e) => e.categoryId === activeCategory);
  const mutation = editing === "new" ? create : update;
  const togglingId = update.isPending && update.variables?.isActive !== undefined ? update.variables.id : null;

  const openEditor = (entry: AdminFaqEntry | "new") => {
    create.reset();
    update.reset();
    setEditing(entry);
    setForm(
      entry === "new"
        ? { categoryId: activeCategory, questionAr: "", answerAr: "", displayOrder: rows.length }
        : { categoryId: entry.categoryId, questionAr: entry.questionAr, answerAr: entry.answerAr, displayOrder: entry.displayOrder },
    );
  };

  const save = () => {
    const done = { onSuccess: () => setEditing(null) };
    if (editing === "new") create.mutate(form, done);
    else if (editing) update.mutate({ id: editing.id, ...form }, done);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <AdminPageHeader title="أسئلة الدولا الرقمية" description="الأسئلة المخفية لا تظهر للأمهات ولا في أسئلة المتابعة المقترحة" />
        <AdminButton tone="positive" className="h-9" disabled={!activeCategory} onClick={() => openEditor("new")}>
          <Plus className="size-4" />
          سؤال جديد
        </AdminButton>
      </div>

      {cats.length > 0 && (
        <FilterChips
          value={activeCategory}
          onChange={setCategoryId}
          options={cats.map((c) => ({ value: c.id, label: `${c.nameAr} (${all.filter((e) => e.categoryId === c.id).length})` }))}
        />
      )}

      {update.error && editing === null && <ErrorNotice message={update.error.message} />}

      {entries.error || categories.error ? (
        <ErrorNotice message={(entries.error ?? categories.error)!.message} />
      ) : entries.isLoading || categories.isLoading ? (
        <ListSkeleton />
      ) : (
        <AdminPanel className="!p-0">
          {rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">لا توجد أسئلة في هذه الفئة</p>
          ) : (
            <ul className="divide-y divide-slate-700/60">
              {rows.map((e) => (
                <li key={e.id} className={`flex flex-wrap items-start gap-3 px-4 py-3 ${e.isActive ? "" : "opacity-60"}`}>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-100">{e.questionAr}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-400">{e.answerAr}</p>
                  </div>
                  <VisibilityPill active={e.isActive} />
                  <div className="flex gap-1.5">
                    <AdminButton onClick={() => openEditor(e)}>
                      <Pencil className="size-3.5" />
                      تعديل
                    </AdminButton>
                    <VisibilityButton
                      active={e.isActive}
                      busy={togglingId === e.id}
                      onToggle={() => update.mutate({ id: e.id, isActive: !e.isActive })}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      )}

      <EditorModal
        open={editing !== null}
        title={editing === "new" ? "سؤال جديد" : "تعديل السؤال"}
        error={mutation.error?.message}
        saving={mutation.isPending}
        onClose={() => setEditing(null)}
        onSubmit={save}
      >
        <Field label="الفئة">
          <select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} className={`${adminInputClass} w-full`}>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameAr}
              </option>
            ))}
          </select>
        </Field>
        <Field label="السؤال">
          <input required minLength={3} value={form.questionAr} onChange={(e) => setForm((f) => ({ ...f, questionAr: e.target.value }))} className={`${adminInputClass} w-full`} />
        </Field>
        <Field label="الإجابة" hint="نص عادي — تُحذف أي وسوم HTML عند الحفظ">
          <textarea required minLength={3} rows={8} value={form.answerAr} onChange={(e) => setForm((f) => ({ ...f, answerAr: e.target.value }))} className={adminTextareaClass} />
        </Field>
        <Field label="الترتيب داخل الفئة" hint="الأصغر يظهر أولًا">
          <input
            type="number"
            min={0}
            value={form.displayOrder ?? 0}
            onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))}
            className={`${adminInputClass} w-28`}
          />
        </Field>
      </EditorModal>
    </div>
  );
}
