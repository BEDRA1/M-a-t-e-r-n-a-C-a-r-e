"use client";

import { Grid2x2 } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useFaqEntry } from "@/lib/hooks/useFaq";
import { DoulaBubble } from "./ChatBubble";

export function AnswerMessage({
  entryId,
  onSelectRelated,
  onShowCategories,
}: {
  entryId: string;
  onSelectRelated: (entryId: string, questionAr: string) => void;
  onShowCategories: () => void;
}) {
  const entry = useFaqEntry(entryId);

  if (entry.isLoading || !entry.data) {
    return (
      <div className="flex justify-end gap-2">
        <Skeleton className="h-20 w-full max-w-[75%] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <DoulaBubble>{entry.data.answerAr}</DoulaBubble>

      <div className="flex justify-end">
        <div className="flex max-w-[85%] flex-wrap justify-end gap-2 sm:max-w-[75%]">
          {entry.data.relatedEntries.map((related) => (
            <button
              key={related.id}
              type="button"
              onClick={() => onSelectRelated(related.id, related.questionAr)}
              className="rounded-full border-2 border-doula-200 bg-doula-50 px-4 py-3 text-sm font-semibold text-doula-700 transition-colors active:scale-[0.98] hover:border-doula-500 hover:bg-doula-500 hover:text-white"
            >
              {related.questionAr}
            </button>
          ))}
          <button
            type="button"
            onClick={onShowCategories}
            className="flex items-center gap-1.5 rounded-full border-2 border-black/10 bg-surface px-4 py-3 text-sm font-semibold text-foreground/70 transition-colors active:scale-[0.98] hover:border-doula-300 hover:bg-doula-50"
          >
            <Grid2x2 className="size-3.5" strokeWidth={2} />
            أسئلة أخرى
          </button>
        </div>
      </div>
    </div>
  );
}
