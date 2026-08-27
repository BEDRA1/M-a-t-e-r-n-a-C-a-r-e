"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "../api-client";
import type { Product, ProductOrder } from "../types";

export function useProductsCatalog() {
  return useQuery({
    queryKey: ["products", "catalog"],
    queryFn: () => apiGet<Product[]>("products"),
  });
}

export interface ProductOrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateProductOrderInput {
  items: ProductOrderItemInput[];
  deliveryAddress: string;
}

export function useCreateProductOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductOrderInput) => apiPost<ProductOrder>("product-orders", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-orders", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["products", "catalog"] });
    },
  });
}

export function useMyProductOrders() {
  return useQuery({
    queryKey: ["product-orders", "mine"],
    queryFn: () => apiGet<ProductOrder[]>("product-orders/mine"),
  });
}

export function useCancelProductOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPost<ProductOrder>(`product-orders/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-orders", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["products", "catalog"] });
    },
  });
}
