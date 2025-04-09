import { useQuery, useMutation } from "@tanstack/react-query";
import { BotSettings } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useBotSettings() {
  return useQuery<BotSettings>({
    queryKey: ['/api/bot-settings'],
    retry: false,
  });
}

export function useUpdateBotSettings() {
  return useMutation({
    mutationFn: async (settings: Partial<BotSettings>) => {
      const res = await apiRequest('PATCH', '/api/bot-settings', settings);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bot-settings'] });
    },
  });
}

export function useCreateBotSettings() {
  return useMutation({
    mutationFn: async (settings: Partial<BotSettings>) => {
      const res = await apiRequest('POST', '/api/bot-settings', settings);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bot-settings'] });
    },
  });
}
