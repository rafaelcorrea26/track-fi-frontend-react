import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/services/api'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // 401 é tratado globalmente (sessão expirada) — não adianta repetir
        if (error instanceof ApiError && error.status === 401) return false
        return failureCount < 1
      },
      refetchOnWindowFocus: false,
    },
  },
})
