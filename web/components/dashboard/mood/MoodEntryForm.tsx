"use client";

import { useState } from "react";
import { Frown, Meh, Smile, SmilePlus, Laugh, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { useAddMoodLog } from "@/lib/hooks/useMood";
import { moodLevelLabel } from "@/lib/format";

const MOOD_LEVELS: { level: number; icon: LucideIcon }[] = [
  { level: 1, icon: Frown },
  { level: 2, icon: Meh },
  { level: 3, icon: Smile },
  { level: 4, icon: SmilePlus },
  { level: 5, icon: Laugh },
];

export function MoodEntryForm() {
  const addMoodLog = useAddMoodLog();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [justLogged, setJustLogged] = useState<number | null>(null);

  const handleSubmit = () => {
    if (!selectedLevel) return;
    addMoodLog.mutate(
      { moodLevel: selectedLevel, notes: notes.trim() || undefined },
      {
        onSuccess: () => {
          setJustLogged(selectedLevel);
          setTimeout(() => setJustLogged(null), 3000);
        },
      },
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">كيف تشعرين اليوم؟</h2>
        {justLogged && (
          <span className="text-sm font-medium text-emerald-600">
            تم تسجيل حالتك: {moodLevelLabel(justLogged)}
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2 sm:gap-3">
        {MOOD_LEVELS.map(({ level, icon: Icon }) => {
          const isActive = selectedLevel === level;
          return (
            <button
              key={level}
              type="button"
              onClick={() => setSelectedLevel(level)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border p-3 transition-colors sm:p-4",
                isActive
                  ? "border-primary-400 bg-primary-50"
                  : "border-black/10 bg-surface hover:border-primary-200 hover:bg-primary-50/50",
              )}
            >
              <Icon
                className={cn("size-6 sm:size-7", isActive ? "text-primary-600" : "text-foreground/70")}
                strokeWidth={1.75}
              />
              <span className="text-center text-[11px] font-medium leading-tight text-muted sm:text-xs">
                {moodLevelLabel(level)}
              </span>
            </button>
          );
        })}
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="ملاحظة اختيارية عن يومك..."
        rows={2}
        maxLength={1000}
        className="mt-4 w-full resize-none rounded-xl border border-black/10 bg-surface p-3 text-sm text-foreground placeholder:text-muted focus:border-primary-300 focus:outline-none"
      />

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!selectedLevel}
        loading={addMoodLog.isPending}
        className="mt-3 w-full rounded-full sm:w-auto"
      >
        تسجيل
      </Button>
    </div>
  );
}
