import { useQuery } from '@tanstack/react-query'
import type { Account } from '@/types'
import { api } from '@/services/api'

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => api<Account[]>('/accounts').then(d => d ?? []),
    staleTime: 5 * 60 * 1000,
  })
}
