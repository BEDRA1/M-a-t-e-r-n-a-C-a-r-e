import { cn } from "@/lib/cn";

/** الشعار الموحّد للعلامة — يُستخدم في كل مكان (الهيدر، الفوتر، شريط لوحة التحكم، صفحة الدخول) */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-full", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.jpg" alt="Materna Care" className="size-full object-cover" />
    </span>
  );
}
