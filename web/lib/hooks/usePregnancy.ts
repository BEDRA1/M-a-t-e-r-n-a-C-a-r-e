"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPatch, apiPost } from "../api-client";
import type { Pregnancy, PregnancyCalcMethod, WeekContent, WeeklyLog } from "../types";

export interface CreatePregnancyInput {
  calcMethod: PregnancyCalcMethod;
  lmpDate?: string;
  conceptionDate?: string;
  ultrasoundDate?: string;
  ultrasoundWeeks?: number;
  isFirstPregnancy?: boolean;
  previousPregnanciesCount?: number;
  hasHealthCondition?: boolean;
  healthConditionNote?: string;
}

export interface UpdatePregnancyInput {
  status?: "active" | "completed" | "ended";
  birthDate?: string;
  deliveryType?: "natural" | "cesarean";
  hasComplications?: boolean;
  isBreastfeeding?: boolean;
  hasHealthCondition?: boolean;
  healthConditionNote?: string;
}

export function usePregnancy() {
  return useQuery({
    queryKey: ["pregnancy", "me"],
    queryFn: () => apiGet<Pregnancy>("pregnancy/me"),
    retry: false,
  });
}

export function useCreatePregnancy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePregnancyInput) => apiPost<Pregnancy>("pregnancy", input),
    onSuccess: (data) => {
      queryClient.setQueryData(["pregnancy", "me"], data);
    },
  });
}

// تُستخدم في تدفّق التسجيل لمسار "أنا في فترة النفاس": تُنشئ الحمل أولاً بطريقة create()
// العادية ثم تُنهيه فورًا بهذا الاستدعاء — المعاملة الحالية في PregnancyService.update() تُنشئ
// postpartum_period تلقائيًا عند closingNow، فلا حاجة لأي endpoint خلفي جديد
export function useUpdatePregnancy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePregnancyInput) => apiPatch<Pregnancy>("pregnancy", input),
    onSuccess: (data) => {
      queryClient.setQueryData(["pregnancy", "me"], data);
    },
  });
}

export function useWeeklyLogs() {
  return useQuery({
    queryKey: ["pregnancy", "weekly-logs"],
    queryFn: () => apiGet<WeeklyLog[]>("pregnancy/weekly-logs"),
  });
}

export interface AddWeeklyLogInput {
  weekNumber: number;
  weightKg?: number;
  symptoms?: string[];
  notes?: string;
}

export function useAddWeeklyLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddWeeklyLogInput) => apiPost<WeeklyLog>("pregnancy/weekly-logs", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pregnancy", "weekly-logs"] });
    },
  });
}

export function useDeleteWeeklyLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<{ deleted: boolean }>(`pregnancy/weekly-logs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pregnancy", "weekly-logs"] });
    },
  });
}

export function useWeekContent(weekNumber: number | undefined) {
  return useQuery({
    queryKey: ["pregnancy", "week-content", weekNumber],
    queryFn: () => apiGet<WeekContent>(`pregnancy/week-content/${weekNumber}`),
    enabled: typeof weekNumber === "number" && weekNumber > 0,
    retry: false,
  });
}
