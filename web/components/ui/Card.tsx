import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-card)] bg-surface border border-black/5 shadow-[var(--shadow-soft)] p-6",
        className,
      )}
      {...props}
    />
  );
}
