"use client";

import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert } from "@/components/ui/Alert";
import { useSpecialistPatients } from "@/lib/hooks/useSpecialistPatients";
import { ApiError } from "@/lib/api-client";
import { PatientCard } from "./PatientCard";

export function SpecialistPatientsContent() {
  const patients = useSpecialistPatients();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">مريضاتي</h1>
        <p className="mt-1 text-sm text-slate-500">الأمهات اللواتي لديهن حجز مؤكد أو مكتمل معك.</p>
      </div>

      {patients.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : patients.isError ? (
        <Alert tone="error">
          {patients.error instanceof ApiError ? patients.error.message : "تعذّر تحميل قائمة المريضات"}
        </Alert>
      ) : !patients.data || patients.data.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 py-10 text-center text-slate-400">
          <Users className="size-8" strokeWidth={1.5} />
          <p>لا توجد مريضات بعد — تظهر الأم هنا بعد أول حجز مؤكد معها.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {patients.data.map((patient) => (
            <PatientCard key={patient.userId} patient={patient} />
          ))}
        </div>
      )}
    </div>
  );
}
