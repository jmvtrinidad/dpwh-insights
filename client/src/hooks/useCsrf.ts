import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

interface CsrfResponse {
  csrfToken: string;
}

export function useCsrf() {
  const { isAuthenticated } = useAuth();
  
  const { data: csrfData, isLoading } = useQuery<CsrfResponse>({
    queryKey: ["/api/csrf-token"],
    enabled: isAuthenticated,
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    csrfToken: csrfData?.csrfToken,
    isLoading,
  };
}