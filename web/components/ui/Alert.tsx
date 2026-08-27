import { cn } from "@/lib/cn";

type Tone = "error" | "success" | "info";

const toneClasses: Record<Tone, string> = {
  error: "bg-red-50 text-red-700 border-red-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  info: "bg-accent-50 text-accent-700 border-accent-200",
};

export function Alert({ tone = "info", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-sm", toneClasses[tone])} role="alert">
      {children}
    </div>
  );
}
