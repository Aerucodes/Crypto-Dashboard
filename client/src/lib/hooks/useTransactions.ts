import { useQuery, useMutation } from "@tanstack/react-query";
import { Transaction, InsertTransaction } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export function useTransactions(limit: number = 50, offset: number = 0, currency?: string) {
  const queryString = new URLSearchParams();
  if (limit) queryString.append('limit', limit.toString());
  if (offset) queryString.append('offset', offset.toString());
  if (currency) queryString.append('currency', currency);
  
  const url = `/api/transactions?${queryString.toString()}`;
  
  return useQuery<TransactionsResponse>({
    queryKey: ['/api/transactions', limit, offset, currency],
    retry: false,
  });
}

export function useTransaction(id: number) {
  return useQuery<Transaction>({
    queryKey: [`/api/transactions/${id}`],
    retry: false,
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  return useMutation({
    mutationFn: async (transaction: InsertTransaction) => {
      const res = await apiRequest('POST', '/api/transactions', transaction);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
  });
}

export function useUpdateTransaction() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertTransaction> }) => {
      const res = await apiRequest('PATCH', `/api/transactions/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
  });
}
