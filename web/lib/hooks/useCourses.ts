"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "../api-client";
import type { ConsultationType, Course, CourseEnrollment, SpecialistTrack } from "../types";

export interface CourseFilters {
  type?: ConsultationType;
  upcomingOnly?: boolean;
  track?: SpecialistTrack;
}

export function useCourses(filters: CourseFilters = {}) {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.upcomingOnly) params.set("upcoming", "true");
  if (filters.track) params.set("track", filters.track);
  const query = params.toString();

  return useQuery({
    queryKey: ["courses", filters.type ?? "all", filters.upcomingOnly ?? false, filters.track ?? "all"],
    queryFn: () => apiGet<Course[]>(query ? `courses?${query}` : "courses"),
  });
}

export function useCourse(id: string | undefined) {
  return useQuery({
    queryKey: ["courses", "detail", id],
    queryFn: () => apiGet<Course>(`courses/${id}`),
    enabled: Boolean(id),
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => apiPost<CourseEnrollment>(`courses/${courseId}/enroll`),
    onSuccess: (_data, courseId) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["courses", "detail", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions", "mine"] });
    },
  });
}

export function useMyCourseEnrollments() {
  return useQuery({
    queryKey: ["enrollments", "mine"],
    queryFn: () => apiGet<CourseEnrollment[]>("enrollments/mine"),
  });
}

export interface CreateCourseInput {
  title: string;
  description: string;
  type: ConsultationType;
  capacity?: number;
  startDate: string;
  durationText: string;
  durationDays: number;
  price: number;
  contentUrl?: string;
  wilaya?: string;
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCourseInput) => apiPost<Course>("courses", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", "created-by-me"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useUpdateCourse(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CreateCourseInput>) => apiPatch<Course>(`courses/${courseId}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", "created-by-me"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useCourseEnrollments(courseId: string | undefined) {
  return useQuery({
    queryKey: ["courses", "enrollments", courseId],
    queryFn: () => apiGet<CourseEnrollment[]>(`courses/${courseId}/enrollments`),
    enabled: Boolean(courseId),
  });
}

export function useIssueCertificate(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: string) =>
      apiPost<CourseEnrollment>(`courses/${courseId}/enrollments/${enrollmentId}/certificate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", "enrollments", courseId] });
    },
  });
}
