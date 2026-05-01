import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // Desabilita refetch automático ao focar a aba — em app financeiro é
      // melhor o dado atualizar só quando o usuário navega ou muta explicitamente.
      refetchOnWindowFocus: false,
    },
  },
})
