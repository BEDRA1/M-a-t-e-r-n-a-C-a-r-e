import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: { label: string; href: string };
}

/** صفحة عامة لأي ميزة لم تُبنَ بعد — أيقونة كبيرة، عنوان "قريبًا"، ووصف مخصص للميزة */
export function ComingSoonPage({ title, description, icon: Icon, action }: ComingSoonPageProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-accent-100 text-primary-600">
        <Icon className="size-10" strokeWidth={1.75} />
      </span>

      <span className="mt-6 inline-flex rounded-full bg-primary-50 px-4 py-1 text-sm font-semibold text-primary-700">
        قريبًا
      </span>

      <h1 className="mt-4 text-2xl font-extrabold text-foreground">{title}</h1>
      <p className="mt-3 max-w-md leading-relaxed text-muted">{description}</p>

      {action && (
        <Link
          href={action.href}
          className="mt-6 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
