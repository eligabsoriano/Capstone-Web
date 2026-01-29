import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AssignApplicationRequest,
  CreateProductRequest,
  UpdateProductRequest,
} from "@/types/api";
import {
  assignApplication,
  createProduct,
  deleteProduct,
  getOfficerWorkload,
  getProducts,
  updateProduct,
} from "../api/adminApi";

// ============================================================================
// OFFICER WORKLOAD HOOKS
// ============================================================================

export function useOfficerWorkload() {
  return useQuery({
    queryKey: ["admin", "workload"],
    queryFn: async () => {
      const response = await getOfficerWorkload();
      return response.data;
    },
  });
}

export function useAssignApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: AssignApplicationRequest;
    }) => assignApplication(applicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "workload"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}

// ============================================================================
// LOAN PRODUCTS HOOKS
// ============================================================================

export function useProducts(params?: { active?: boolean }) {
  return useQuery({
    queryKey: ["admin", "products", params],
    queryFn: async () => {
      const response = await getProducts(params);
      return response.data;
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: UpdateProductRequest;
    }) => updateProduct(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}
