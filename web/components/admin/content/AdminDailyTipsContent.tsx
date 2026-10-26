"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { AdminButton, AdminPageHeader, AdminPanel, ErrorNotice, FilterChips } from "@/components/admin/AdminUi";
import { EditorModal, Field, ListSkeleton, VisibilityButton, VisibilityPill, adminTextareaClass } from "./ContentUi";
import { AdminDailyTips, type AdminDailyTip } from "@/lib/hooks/useAdminContent";

type Filter = "all" | "active" | "hidden";

export function AdminDailyTipsContent() {
  const tips = AdminDailyTips.useList();
  const create = AdminDailyTips.useCreate();
  const update = AdminDailyTips.useUpdate();

  const [filter, setFilter] = useState<Filter>("all");
  const [editing, setEditing] = useState<AdminDailyTip | "new" | null>(null);
  const [text, setText] = useState("");
  const mutation = editing === "new" ? create : update;
  const togglingId = update.isPending && update.variables?.isActive !== undefined ? update.variables.id : null;

  const all = tips.data ?? [];
  const activeCount = all.filter((t) => t.isActive).length;
  const rows = all.filter((t) => (filter === "all" ? true : filter === "active" ? t.isActive : !t.isActive));

  const openEditor = (tip: AdminDailyTip | "new") => {
    create.reset();
    update.reset();
    setEditing(tip);
    setText(tip === "new" ? "" : tip.tipTextAr);
  };

  const save = () => {
    const done = { onSuccess: () => setEditing(null) };
    if (editing === "new") create.mutate({ tipTextAr: text }, done);
    else if (editing) update.mutate({ id: editing.id, tipTextAr: text }, done);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <AdminPageHeader
          title="النصائح اليومية"
          description={`نصيحة واحدة لكل يوم بالتناوب بين النصائح المفعّلة (${activeCount} حاليًا) — المخفية تخرج من التناوب`}
        />
        <AdminButton tone="positive" className="h-9" onClick={() => openEditor("new")}>
          <Plus className="size-4" />
          نصيحة جديدة
        </AdminButton>
      </div>

      <FilterChips
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: `الكل (${all.length})` },
          { value: "active", label: `مفعّلة (${activeCount})` },
          { value: "hidden", label: `مخفية (${all.length - activeCount})` },
        ]}
      />

      {update.error && editing === null && <ErrorNotice message={update.error.message} />}

      {tips.error ? (
        <ErrorNotice message={tips.error.message} />
      ) : tips.isLoading ? (
        <ListSkeleton />
      ) : (
        <AdminPanel className="!p-0">
          {rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">لا توجد نصائح</p>
          ) : (
            <ul className="divide-y divide-slate-700/60">
              {rows.map((t) => (
                <li key={t.id} className={`flex flex-wrap items-center gap-3 px-4 py-3 ${t.isActive ? "" : "opacity-60"}`}>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold tabular-nums text-slate-400">
                    {t.tipNumber}
                  </span>
                  <p className="min-w-0 flex-1 text-sm text-slate-100">{t.tipTextAr}</p>
                  <VisibilityPill active={t.isActive} activeLabel="مفعّلة" hiddenLabel="مخفية" />
                  <div className="flex gap-1.5">
                    <AdminButton onClick={() => openEditor(t)}>
                      <Pencil className="size-3.5" />
                      تعديل
                    </AdminButton>
                    <VisibilityButton
                      active={t.isActive}
                      busy={togglingId === t.id}
                      showLabel="تفعيل"
                      onToggle={() => update.mutate({ id: t.id, isActive: !t.isActive })}
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
        title={editing === "new" ? "نصيحة جديدة" : `تعديل النصيحة رقم ${editing?.tipNumber ?? ""}`}
        error={mutation.error?.message}
        saving={mutation.isPending}
        onClose={() => setEditing(null)}
        onSubmit={save}
      >
        <Field label="نص النصيحة" hint={`${text.length}/500`}>
          <textarea required minLength={5} maxLength={500} rows={4} value={text} onChange={(e) => setText(e.target.value)} className={adminTextareaClass} />
        </Field>
      </EditorModal>
    </div>
  );
}
