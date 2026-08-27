"use client";

import { Card } from "@/components/ui/Card";
import { ReminderForm } from "@/components/dashboard/ReminderForm";
import { RemindersList } from "@/components/dashboard/RemindersList";

export function RemindersPageContent() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">التذكيرات</h1>
        <p className="mt-1 text-sm text-muted">نظّمي فيتاميناتك وأدويتك ومواعيدك الطبية.</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[380px_1fr]">
        <Card>
          <h2 className="text-lg font-bold text-foreground">تذكير جديد</h2>
          <div className="mt-4">
            <ReminderForm />
          </div>
        </Card>

        <RemindersList />
      </div>
    </div>
  );
}
