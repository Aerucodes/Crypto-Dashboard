import { useQuery } from "@tanstack/react-query";
import { Stats } from "@shared/schema";

export function useStats() {
  return useQuery<Stats>({
    queryKey: ['/api/stats'],
    retry: false,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
