import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  AssignApplicationRequest,
  CreateProductRequest,
  OfficerWorkloadParams,
  ReassignApplicationRequest,
  UpdateProductRequest,
} from "@/types/api";
import {
  assignApplication,
  createProduct,
  deleteProduct,
  getOfficerWorkload,
  getProducts,
  reassignApplication,
  updateProduct,
} from "../api/adminApi";

// ============================================================================
// OFFICER WORKLOAD HOOKS
// ============================================================================

export function useOfficerWorkload(params?: OfficerWorkloadParams) {
  return useQuery({
    queryKey: ["admin", "workload", params],
    queryFn: async () => {
      const response = await getOfficerWorkload(params);
      return response.data;
    },
    placeholderData: keepPreviousData,
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
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] });
    },
  });
}

export function useReassignApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: ReassignApplicationRequest;
    }) => reassignApplication(applicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "workload"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] });
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
    onSuccess: async () => {
      // Force refetch by invalidating and removing stale cache
      await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      await queryClient.refetchQueries({ queryKey: ["admin", "products"] });
    },
  });
}
