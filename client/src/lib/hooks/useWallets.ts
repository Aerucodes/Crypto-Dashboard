import { useQuery, useMutation } from "@tanstack/react-query";
import { Wallet, InsertWallet } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useWallets() {
  return useQuery<Wallet[]>({
    queryKey: ['/api/wallets'],
    retry: false,
  });
}

export function useWallet(id: number) {
  return useQuery<Wallet>({
    queryKey: [`/api/wallets/${id}`],
    retry: false,
    enabled: !!id,
  });
}

export function useCreateWallet() {
  return useMutation({
    mutationFn: async (wallet: InsertWallet) => {
      const res = await apiRequest('POST', '/api/wallets', wallet);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
  });
}

export function useUpdateWallet() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertWallet> }) => {
      const res = await apiRequest('PATCH', `/api/wallets/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
  });
}

export function useDeleteWallet() {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/wallets/${id}`, undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
  });
}
