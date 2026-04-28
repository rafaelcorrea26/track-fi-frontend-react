export type DreamStatus = 'active' | 'completed' | 'paused' | 'cancelled'

export const DREAM_STATUS_LABELS: Record<DreamStatus, string> = {
  active: 'Ativo',
  completed: 'Concluído',
  paused: 'Pausado',
  cancelled: 'Cancelado',
}

export const DREAM_STATUS_COLORS: Record<DreamStatus, string> = {
  active: 'text-[hsl(142,71%,45%)]',
  completed: 'text-[hsl(215,70%,60%)]',
  paused: 'text-[hsl(38,92%,50%)]',
  cancelled: 'text-[hsl(215,20%,45%)]',
}
