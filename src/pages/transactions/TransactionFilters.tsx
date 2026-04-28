import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { TransactionType } from './types'
import { TX_TYPE_LABELS } from './types'

type Props = {
  month: number
  year: number
  typeFilter: TransactionType | 'all'
  onMonthChange: (month: number, year: number) => void
  onTypeChange: (type: TransactionType | 'all') => void
}

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default function TransactionFilters({ month, year, typeFilter, onMonthChange, onTypeChange }: Props) {
  function prev() {
    if (month === 1) onMonthChange(12, year - 1)
    else onMonthChange(month - 1, year)
  }

  function next() {
    if (month === 12) onMonthChange(1, year + 1)
    else onMonthChange(month + 1, year)
  }

  const types: (TransactionType | 'all')[] = ['all', 'income', 'expense', 'saving', 'transfer']

  return (
    <div className="flex flex-col gap-3">
      {/* navegação de mês */}
      <div className="flex items-center gap-2 bg-[hsl(222,20%,11%)] border border-[hsl(217,20%,18%)] rounded-xl px-4 py-2 self-start">
        <button onClick={prev} className="text-[hsl(215,20%,55%)] hover:text-[hsl(210,40%,96%)] transition-colors">
          <ChevronLeft size={16} />
        </button>
        <span className="text-[hsl(210,40%,96%)] text-sm font-medium w-20 text-center">
          {MONTHS[month - 1]} {year}
        </span>
        <button onClick={next} className="text-[hsl(215,20%,55%)] hover:text-[hsl(210,40%,96%)] transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* filtro de tipo */}
      <div className="flex gap-2 flex-wrap">
        {types.map(t => (
          <button
            key={t}
            onClick={() => onTypeChange(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              typeFilter === t
                ? 'bg-[hsl(142,71%,45%)] text-[hsl(144,100%,6%)] border-transparent'
                : 'border-[hsl(217,20%,18%)] text-[hsl(215,20%,55%)] hover:text-[hsl(210,40%,96%)]'
            }`}
          >
            {t === 'all' ? 'Todos' : TX_TYPE_LABELS[t]}
          </button>
        ))}
      </div>
    </div>
  )
}
