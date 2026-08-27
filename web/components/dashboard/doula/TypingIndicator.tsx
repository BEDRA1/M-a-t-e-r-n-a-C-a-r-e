import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex justify-end gap-2">
      <div className="flex items-center gap-1.5 rounded-2xl border border-doula-100 bg-doula-50 px-4 py-3.5 shadow-[var(--shadow-soft)]">
        <span className="size-1.5 animate-bounce rounded-full bg-doula-400 [animation-delay:-0.3s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-doula-400 [animation-delay:-0.15s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-doula-400" />
      </div>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-doula-100 text-doula-600">
        <Bot className="size-4" strokeWidth={2} />
      </span>
    </div>
  );
}
