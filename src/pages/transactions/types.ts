export type TransactionType = 'income' | 'expense' | 'transfer' | 'saving'

export const TX_TYPE_LABELS: Record<TransactionType, string> = {
  income: 'Receita',
  expense: 'Despesa',
  transfer: 'Transferência',
  saving: 'Guardar para sonho',
}

export const TX_TYPE_COLORS: Record<TransactionType, string> = {
  income: 'text-[hsl(142,71%,45%)]',
  expense: 'text-[hsl(0,84%,60%)]',
  transfer: 'text-[hsl(215,70%,60%)]',
  saving: 'text-[hsl(38,92%,50%)]',
}

export const TX_TYPE_BG: Record<TransactionType, string> = {
  income: 'bg-[hsl(142,71%,45%)]/10 border-[hsl(142,71%,45%)]/30',
  expense: 'bg-[hsl(0,84%,60%)]/10 border-[hsl(0,84%,60%)]/30',
  transfer: 'bg-[hsl(215,70%,60%)]/10 border-[hsl(215,70%,60%)]/30',
  saving: 'bg-[hsl(38,92%,50%)]/10 border-[hsl(38,92%,50%)]/30',
}
