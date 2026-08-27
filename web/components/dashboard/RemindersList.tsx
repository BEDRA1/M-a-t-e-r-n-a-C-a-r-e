"use client";

import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  useDeleteReminder,
  useReminders,
  useToggleReminderDone,
} from "@/lib/hooks/useReminders";
import { formatArabicDateTime, reminderTypeLabel } from "@/lib/format";
import { cn } from "@/lib/cn";

export function RemindersList() {
  const reminders = useReminders();
  const toggleDone = useToggleReminderDone();
  const deleteReminder = useDeleteReminder();

  if (reminders.isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (!reminders.data || reminders.data.length === 0) {
    return (
      <Card>
        <p className="text-sm text-muted">لا توجد تذكيرات بعد، أضيفي أول تذكير لكِ.</p>
      </Card>
    );
  }

  const sorted = [...reminders.data].sort(
    (a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime(),
  );

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {sorted.map((reminder) => (
        <li key={reminder.id}>
          <Card
            className={cn(
              "flex h-full items-center justify-between gap-4",
              reminder.isDone && "opacity-60",
            )}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={reminder.isDone}
                onChange={(e) =>
                  toggleDone.mutate({ id: reminder.id, isDone: e.target.checked })
                }
                className="mt-1 size-5 accent-primary-500"
                aria-label="تعليم كمنجز"
              />
              <div>
                <p
                  className={cn(
                    "font-semibold text-foreground",
                    reminder.isDone && "line-through",
                  )}
                >
                  {reminder.title}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <Badge tone="accent">{reminderTypeLabel(reminder.type)}</Badge>
                  <span>{formatArabicDateTime(reminder.scheduledTime)}</span>
                  {reminder.recurrence && <span>يتكرر: {reminder.recurrence}</span>}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteReminder.mutate(reminder.id)}
              loading={deleteReminder.isPending && deleteReminder.variables === reminder.id}
            >
              حذف
            </Button>
          </Card>
        </li>
      ))}
    </ul>
  );
}
