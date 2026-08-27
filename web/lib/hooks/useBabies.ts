"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPatch, apiPost } from "../api-client";
import type { Baby, BabyCheckup, BabyGender } from "../types";

export function useBabies() {
  return useQuery({
    queryKey: ["babies"],
    queryFn: () => apiGet<Baby[]>("babies"),
    // 404 "غير مرتبط بعائلة" متوقعة تمامًا لأم جديدة، لا داعي لإعادة المحاولة عليها
    retry: false,
  });
}

export function useBaby(babyId: string | undefined) {
  return useQuery({
    queryKey: ["babies", babyId],
    queryFn: () => apiGet<Baby>(`babies/${babyId}`),
    enabled: Boolean(babyId),
  });
}

export interface BabyInput {
  fullName: string;
  birthDate: string;
  gender: BabyGender;
  weightGrams?: number;
  heightCm?: number;
}

export function useCreateBaby() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: BabyInput) => {
      // تضمن وجود سجل عائلة قبل إنشاء الطفل — أم جديدة قد لا تملك عائلة بعد إن لم
      // تُنشئ كود دعوة من قبل. الاستدعاء آمن ومتكرر (idempotent يُنشئ أو يُعيد الموجود)،
      // ونتجاهل فشله بصمت (مثلًا حساب الزوج ممنوع من إنشاء عائلة) لأن الخطأ الحقيقي
      // سيظهر بوضوح من استدعاء إنشاء الطفل نفسه إن بقيت المشكلة قائمة
      await apiPost("families/invite").catch(() => undefined);
      return apiPost<Baby>("babies", input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["babies"] });
    },
  });
}

export function useUpdateBaby() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<BabyInput> & { id: string }) =>
      apiPatch<Baby>(`babies/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["babies"] });
    },
  });
}

export function useDeleteBaby() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<{ deleted: boolean }>(`babies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["babies"] });
    },
  });
}

export interface CheckupInput {
  title: string;
  scheduledDate: string;
  notes?: string;
  completed?: boolean;
}

export function useCreateCheckup(babyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CheckupInput) => apiPost<BabyCheckup>(`babies/${babyId}/checkups`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["babies"] });
    },
  });
}

export function useUpdateCheckup(babyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<CheckupInput> & { id: string }) =>
      apiPatch<BabyCheckup>(`babies/${babyId}/checkups/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["babies"] });
    },
  });
}

export function useDeleteCheckup(babyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (checkupId: string) =>
      apiDelete<{ deleted: boolean }>(`babies/${babyId}/checkups/${checkupId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["babies"] });
    },
  });
}
