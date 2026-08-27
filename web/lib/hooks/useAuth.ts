"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost, authLogin, authLogout, authRegister } from "../api-client";
import type { User } from "../types";

export interface RegisterInput {
  phone: string;
  password: string;
  role: "mother" | "spouse";
  wilaya?: string;
  email?: string;
  dateOfBirth?: string;
}

export interface LoginInput {
  phone: string;
  password: string;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: () => apiGet<User>("auth/me"),
    retry: false,
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterInput) => authRegister<{ user: User }>(input),
    onSuccess: (data) => {
      queryClient.setQueryData(["current-user"], data.user);
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => authLogin<{ user: User }>(input),
    onSuccess: (data) => {
      queryClient.setQueryData(["current-user"], data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authLogout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export interface UpdateMeInput {
  email?: string;
  wilaya?: string;
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateMeInput) => apiPatch<User>("auth/me", input),
    onSuccess: (data) => {
      queryClient.setQueryData(["current-user"], data);
    },
  });
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => apiPost<{ success: boolean }>("auth/change-password", input),
  });
}
