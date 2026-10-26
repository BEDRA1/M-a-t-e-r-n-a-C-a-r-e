"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { AdminButton, AdminPageHeader, AdminPanel, ErrorNotice, StatusPill, adminInputClass } from "@/components/admin/AdminUi";
import { EditorModal, Field, ImageUrlField, ListSkeleton, Thumb, VisibilityButton, VisibilityPill, adminTextareaClass, urlOrNull } from "./ContentUi";
import { AdminProducts, type AdminProduct, type ProductInput } from "@/lib/hooks/useAdminContent";
import { formatDzd } from "@/lib/format";

const EMPTY: ProductInput & { imageUrl: string } = { name: "", description: "", category: "", price: 0, stockQuantity: 0, imageUrl: "" };

function stockTone(qty: number) {
  return qty === 0 ? "alert" : qty <= 5 ? "warning" : "neutral";
}

export function AdminProductsContent() {
  const products = AdminProducts.useList();
  const create = AdminProducts.useCreate();
  const update = AdminProducts.useUpdate();

  const [editing, setEditing] = useState<AdminProduct | "new" | null>(null);
  const [form, setForm] = useState(EMPTY);
  const mutation = editing === "new" ? create : update;
  const togglingId = update.isPending && update.variables?.isActive !== undefined ? update.variables.id : null;
  const categories = [...new Set((products.data ?? []).map((p) => p.category))];

  const openEditor = (product: AdminProduct | "new") => {
    create.reset();
    update.reset();
    setEditing(product);
    setForm(
      product === "new"
        ? EMPTY
        : {
            name: product.name,
            description: product.description,
            category: product.category,
            price: product.price,
            stockQuantity: product.stockQuantity,
            imageUrl: product.imageUrl ?? "",
          },
    );
  };

  const save = () => {
    const input = { ...form, imageUrl: urlOrNull(form.imageUrl) };
    const done = { onSuccess: () => setEditing(null) };
    if (editing === "new") create.mutate(input, done);
    else if (editing) update.mutate({ id: editing.id, ...input }, done);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <AdminPageHeader title="المتجر" description="المنتج المخفي يختفي من المتجر ولا يمكن طلبه، وطلباته السابقة تبقى كما هي" />
        <AdminButton tone="positive" className="h-9" onClick={() => openEditor("new")}>
          <Plus className="size-4" />
          منتج جديد
        </AdminButton>
      </div>

      {update.error && editing === null && <ErrorNotice message={update.error.message} />}

      {products.error ? (
        <ErrorNotice message={products.error.message} />
      ) : products.isLoading ? (
        <ListSkeleton />
      ) : (
        <AdminPanel className="!p-0">
          {(products.data ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">لا توجد منتجات</p>
          ) : (
            <ul className="divide-y divide-slate-700/60">
              {(products.data ?? []).map((p) => (
                <li key={p.id} className={`flex flex-wrap items-center gap-3 px-4 py-3 ${p.isActive ? "" : "opacity-60"}`}>
                  <Thumb src={p.imageUrl} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-100">{p.name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{p.category}</p>
                  </div>
                  <span className="text-sm tabular-nums text-emerald-400">{formatDzd(p.price)}</span>
                  <StatusPill tone={stockTone(p.stockQuantity)}>المخزون: {p.stockQuantity}</StatusPill>
                  <VisibilityPill active={p.isActive} />
                  <div className="flex gap-1.5">
                    <AdminButton onClick={() => openEditor(p)}>
                      <Pencil className="size-3.5" />
                      تعديل
                    </AdminButton>
                    <VisibilityButton active={p.isActive} busy={togglingId === p.id} onToggle={() => update.mutate({ id: p.id, isActive: !p.isActive })} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      )}

      <EditorModal
        open={editing !== null}
        title={editing === "new" ? "منتج جديد" : "تعديل المنتج"}
        error={mutation.error?.message}
        saving={mutation.isPending}
        onClose={() => setEditing(null)}
        onSubmit={save}
      >
        <Field label="الاسم">
          <input required minLength={2} maxLength={200} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={`${adminInputClass} w-full`} />
        </Field>
        <Field label="الوصف">
          <textarea required minLength={5} rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={adminTextareaClass} />
        </Field>
        <Field label="الفئة">
          <input
            required
            minLength={2}
            list="product-categories"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className={`${adminInputClass} w-full`}
          />
          <datalist id="product-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="السعر (دج)" hint="للطلبات الجديدة فقط">
            <input required type="number" min={0} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} className={`${adminInputClass} w-full`} />
          </Field>
          <Field label="المخزون">
            <input
              required
              type="number"
              min={0}
              value={form.stockQuantity}
              onChange={(e) => setForm((f) => ({ ...f, stockQuantity: Number(e.target.value) }))}
              className={`${adminInputClass} w-full`}
            />
          </Field>
        </div>
        <ImageUrlField value={form.imageUrl} onChange={(v) => setForm((f) => ({ ...f, imageUrl: v }))} />
      </EditorModal>
    </div>
  );
}
