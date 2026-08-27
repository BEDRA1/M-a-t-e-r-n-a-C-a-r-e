import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  text: string;
  className?: string;
}

/** بطاقة "ماذا نقدم" — أيقونة + عنوان + شرح، تُستخدم بترتيبات مختلفة (شبكة/قائمة) حسب الصفحة */
export function FeatureCard({ icon: Icon, title, text, className }: FeatureCardProps) {
  return (
    <div className={cn("flex items-start gap-3.5", className)}>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
        <Icon className="size-5" strokeWidth={2} />
      </span>
      <div>
        <p className="font-bold text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
      </div>
    </div>
  );
}
