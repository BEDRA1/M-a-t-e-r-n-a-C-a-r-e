"use client";

import { cn } from "@/lib/cn";

/** بلا transform/translate — flexbox justify-start/end يتكيّف تلقائيًا مع RTL دون أي حساب اتجاه يدوي */
export function Switch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "justify-end bg-primary-500" : "justify-start bg-black/15",
      )}
    >
      <span className="size-5 rounded-full bg-white shadow-sm transition-transform" />
    </button>
  );
}
