"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "../api-client";
import type {
  AssessmentAnswerInput,
  AssessmentDomain,
  AssessmentQuestion,
  AssessmentResult,
  SubmitAssessmentResponse,
} from "../types";

export function useAssessmentDomains() {
  return useQuery({
    queryKey: ["assessments", "domains"],
    queryFn: () => apiGet<AssessmentDomain[]>("assessments/domains"),
  });
}

export function useAssessmentQuestions(domainId: string | undefined) {
  return useQuery({
    queryKey: ["assessments", "domains", domainId, "questions"],
    queryFn: () =>
      apiGet<{ domain: AssessmentDomain; questions: AssessmentQuestion[]; disclaimerText: string }>(
        `assessments/domains/${domainId}/questions`,
      ),
    enabled: Boolean(domainId),
  });
}

export interface SubmitAssessmentInput {
  domainId: string;
  answers: AssessmentAnswerInput[];
}

export function useSubmitAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitAssessmentInput) =>
      apiPost<SubmitAssessmentResponse>("assessments/submit", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments", "history"] });
    },
  });
}

export function useAssessmentHistory(domainId?: string) {
  return useQuery({
    queryKey: ["assessments", "history", domainId ?? "all"],
    queryFn: () =>
      apiGet<AssessmentResult[]>(domainId ? `assessments/history?domain=${domainId}` : "assessments/history"),
  });
}
