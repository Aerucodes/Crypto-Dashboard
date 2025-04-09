import { useQuery, useMutation } from "@tanstack/react-query";
import { WebhookConfig } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useWebhookConfig() {
  return useQuery<WebhookConfig>({
    queryKey: ['/api/webhook-config'],
    retry: false,
  });
}

export function useUpdateWebhookConfig() {
  return useMutation({
    mutationFn: async (config: Partial<WebhookConfig>) => {
      const res = await apiRequest('PATCH', '/api/webhook-config', config);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhook-config'] });
    },
  });
}

export function useCreateWebhookConfig() {
  return useMutation({
    mutationFn: async (config: Partial<WebhookConfig>) => {
      const res = await apiRequest('POST', '/api/webhook-config', config);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhook-config'] });
    },
  });
}
