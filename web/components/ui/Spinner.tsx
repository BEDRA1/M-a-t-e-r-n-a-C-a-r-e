import { cn } from "@/lib/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "size-6 rounded-full border-2 border-primary-200 border-t-primary-500 animate-spin",
        className,
      )}
      role="status"
      aria-label="جارٍ التحميل"
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <Spinner className="size-10" />
    </div>
  );
}
