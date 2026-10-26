"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import {
  AdminButton,
  AdminPageHeader,
  AdminPanel,
  ConfirmDialog,
  ErrorNotice,
  FilterChips,
  StatusPill,
  adminInputClass,
} from "@/components/admin/AdminUi";
import { EditorModal, Field, ImageUrlField, ListSkeleton, Thumb, adminTextareaClass } from "./ContentUi";
import { AdminArticles, useSetArticlePublished, type ArticleInput } from "@/lib/hooks/useAdminContent";
import { ARTICLE_CATEGORIES, ARTICLE_CATEGORY_LIST } from "@/lib/articleCategories";
import { formatArabicDate } from "@/lib/format";
import type { Article } from "@/lib/types";

type Filter = "all" | "published" | "draft";

const EMPTY: ArticleInput = {
  titleAr: "",
  slug: "",
  excerptAr: "",
  contentAr: "",
  coverImageUrl: "",
  category: "pregnancy",
  authorName: "فريق Materna Care",
};

/** الرابط لاتيني فقط (قيد الـBackend) — العنوان عربي، فيُولَّد رابط فريد قابل للتعديل */
const newSlug = () => `article-${Date.now().toString(36)}`;

export function AdminArticlesContent() {
  const articles = AdminArticles.useList();
  const create = AdminArticles.useCreate();
  const update = AdminArticles.useUpdate();
  const setPublished = useSetArticlePublished();

  const [filter, setFilter] = useState<Filter>("all");
  const [editing, setEditing] = useState<Article | "new" | null>(null);
  const [form, setForm] = useState<ArticleInput>(EMPTY);
  const [toggling, setToggling] = useState<Article | null>(null);

  const all = articles.data ?? [];
  const rows = all.filter((a) => (filter === "all" ? true : filter === "published" ? a.isPublished : !a.isPublished));
  const mutation = editing === "new" ? create : update;

  const openEditor = (article: Article | "new") => {
    create.reset();
    update.reset();
    setEditing(article);
    setForm(
      article === "new"
        ? { ...EMPTY, slug: newSlug() }
        : {
            titleAr: article.titleAr,
            slug: article.slug,
            excerptAr: article.excerptAr,
            contentAr: article.contentAr,
            coverImageUrl: article.coverImageUrl,
            category: article.category,
            authorName: article.authorName,
            readTimeMinutes: article.readTimeMinutes ?? undefined,
          },
    );
  };

  const set = <K extends keyof ArticleInput>(key: K, value: ArticleInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  const save = () => {
    const input = { ...form, readTimeMinutes: form.readTimeMinutes || undefined };
    const done = { onSuccess: () => setEditing(null) };
    if (editing === "new") create.mutate(input, done);
    else if (editing) update.mutate({ id: editing.id, ...input }, done);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <AdminPageHeader title="المقالات" description="المقال الجديد يُحفظ مسودة، ولا يظهر للأمهات إلا بعد نشره" />
        <AdminButton tone="positive" className="h-9" onClick={() => openEditor("new")}>
          <Plus className="size-4" />
          مقال جديد
        </AdminButton>
      </div>

      <FilterChips
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: `الكل (${all.length})` },
          { value: "published", label: `منشورة (${all.filter((a) => a.isPublished).length})` },
          { value: "draft", label: `مسودات (${all.filter((a) => !a.isPublished).length})` },
        ]}
      />

      {setPublished.error && <ErrorNotice message={setPublished.error.message} />}

      {articles.error ? (
        <ErrorNotice message={articles.error.message} />
      ) : articles.isLoading ? (
        <ListSkeleton />
      ) : (
        <AdminPanel className="!p-0">
          {rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">لا توجد مقالات</p>
          ) : (
            <ul className="divide-y divide-slate-700/60">
              {rows.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <Thumb src={a.coverImageUrl} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-100">{a.titleAr}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {ARTICLE_CATEGORIES[a.category]?.label ?? a.category} · {a.authorName} · عُدّل{" "}
                      {formatArabicDate(a.updatedAt)}
                    </p>
                  </div>
                  <StatusPill tone={a.isPublished ? "positive" : "warning"}>{a.isPublished ? "منشور" : "مسودة"}</StatusPill>
                  <div className="flex gap-1.5">
                    <AdminButton onClick={() => openEditor(a)}>
                      <Pencil className="size-3.5" />
                      تعديل
                    </AdminButton>
                    <AdminButton tone={a.isPublished ? "neutral" : "positive"} onClick={() => setToggling(a)}>
                      {a.isPublished ? "إلغاء النشر" : "نشر"}
                    </AdminButton>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      )}

      <EditorModal
        open={editing !== null}
        wide
        title={editing === "new" ? "مقال جديد" : "تعديل المقال"}
        error={mutation.error?.message}
        saving={mutation.isPending}
        onClose={() => setEditing(null)}
        onSubmit={save}
      >
        <Field label="العنوان">
          <input required minLength={3} value={form.titleAr} onChange={(e) => set("titleAr", e.target.value)} className={`${adminInputClass} w-full`} />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="الفئة">
            <select value={form.category} onChange={(e) => set("category", e.target.value as ArticleInput["category"])} className={`${adminInputClass} w-full`}>
              {ARTICLE_CATEGORY_LIST.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="الكاتب">
            <input required minLength={2} value={form.authorName} onChange={(e) => set("authorName", e.target.value)} className={`${adminInputClass} w-full`} />
          </Field>
          <Field label="مدة القراءة بالدقائق (اختياري)">
            <input
              type="number"
              min={1}
              value={form.readTimeMinutes ?? ""}
              onChange={(e) => set("readTimeMinutes", e.target.value ? Number(e.target.value) : undefined)}
              className={`${adminInputClass} w-full`}
            />
          </Field>
        </div>
        <Field label="الرابط (slug)" hint="أحرف لاتينية صغيرة وأرقام وشرطات — يظهر في عنوان صفحة المقال">
          <input
            required
            dir="ltr"
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            value={form.slug}
            onChange={(e) => set("slug", e.target.value.trim().toLowerCase())}
            className={`${adminInputClass} w-full text-left font-mono`}
          />
        </Field>
        <ImageUrlField required label="صورة الغلاف" value={form.coverImageUrl} onChange={(v) => set("coverImageUrl", v)} />
        <Field label="الملخص" hint="يظهر في بطاقة المقال بالقائمة">
          <textarea required minLength={10} rows={2} value={form.excerptAr} onChange={(e) => set("excerptAr", e.target.value)} className={adminTextareaClass} />
        </Field>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Field label="المحتوى" hint="نص عادي — اترك سطرًا فارغًا بين الفقرات">
            <textarea
              required
              minLength={50}
              rows={14}
              value={form.contentAr}
              onChange={(e) => set("contentAr", e.target.value)}
              className={adminTextareaClass}
            />
          </Field>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-400">معاينة كما تراها الأم</span>
            {/* نفس طريقة العرض في صفحة المقال (نص مع whitespace-pre-line) — بلا HTML */}
            <div className="h-full min-h-40 overflow-y-auto rounded-lg bg-white p-4 text-[15px] leading-[2] text-slate-800">
              <p className="mb-2 text-lg font-extrabold leading-snug">{form.titleAr || "العنوان"}</p>
              <div className="whitespace-pre-line">{form.contentAr || "سيظهر المحتوى هنا..."}</div>
            </div>
          </div>
        </div>
      </EditorModal>

      <ConfirmDialog
        open={toggling !== null}
        title={toggling?.isPublished ? "إلغاء نشر المقال؟" : "نشر المقال؟"}
        description={
          toggling?.isPublished
            ? "سيختفي المقال من قائمة المقالات عند الأمهات، ويبقى محفوظًا كمسودة."
            : "سيظهر المقال فورًا لكل الأمهات في قسم المقالات."
        }
        confirmLabel={toggling?.isPublished ? "إلغاء النشر" : "نشر"}
        loading={setPublished.isPending}
        onConfirm={() =>
          toggling &&
          setPublished.mutate({ id: toggling.id, published: !toggling.isPublished }, { onSettled: () => setToggling(null) })
        }
        onCancel={() => setToggling(null)}
      />
    </div>
  );
}
