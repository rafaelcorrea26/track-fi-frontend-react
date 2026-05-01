import { useQuery } from '@tanstack/react-query'
import type { Category } from '@/types'
import { api } from '@/services/api'

export function useCategories(type?: 'income' | 'expense') {
  const query = useQuery({
    queryKey: ['categories'],
    queryFn: () => api<Category[]>('/categories').then(d => d ?? []),
    staleTime: Infinity, // categorias mudam raramente na sessão
  })

  const data = type ? (query.data ?? []).filter(c => c.type === type) : (query.data ?? [])

  return { ...query, data }
}
