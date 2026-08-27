"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "../api-client";
import type { ClinicalNote } from "../types";

export interface CreateClinicalNoteInput {
  bookingId: string;
  noteText: string;
  sessionDate: string;
}

export function useClinicalNotes(patientUserId: string | undefined) {
  return useQuery({
    queryKey: ["clinical-notes", patientUserId],
    queryFn: () => apiGet<ClinicalNote[]>(`specialist/clinical-notes?patientUserId=${patientUserId}`),
    enabled: Boolean(patientUserId),
  });
}

export function useCreateClinicalNote(patientUserId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClinicalNoteInput) => apiPost<ClinicalNote>("specialist/clinical-notes", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinical-notes", patientUserId] });
    },
  });
}

export function useUpdateClinicalNote(patientUserId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; noteText?: string; sessionDate?: string }) =>
      apiPatch<ClinicalNote>(`specialist/clinical-notes/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinical-notes", patientUserId] });
    },
  });
}
