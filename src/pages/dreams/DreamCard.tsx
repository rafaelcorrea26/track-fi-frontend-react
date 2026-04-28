import { Pencil, Trash2, PlusCircle, CheckCircle2, PauseCircle } from 'lucide-react'
import type { Dream } from '@/types'
import { DREAM_STATUS_COLORS, type DreamStatus } from './types'
import { formatCurrency, formatDate } from '@/lib/utils'

type Props = {
  dream: Dream
  onEdit: (d: Dream) => void
  onDelete: (d: Dream) => void
  onContribute: (d: Dream) => void
}

export default function DreamCard({ dream: d, onEdit, onDelete, onContribute }: Props) {
  const percent = Math.min(100, d.percent_complete ?? 0)
  const statusColor = DREAM_STATUS_COLORS[d.status as DreamStatus] ?? 'text-[hsl(215,20%,55%)]'
  const isActive = d.status === 'active'
  const isCompleted = d.status === 'completed'

  return (
    <div className={`bg-[hsl(222,20%,11%)] border rounded-xl p-5 flex flex-col gap-4 transition-colors ${
      isCompleted ? 'border-[hsl(215,70%,60%)]/40' : 'border-[hsl(217,20%,18%)]'
    }`}>
      {/* cabeçalho */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isCompleted && <CheckCircle2 size={16} className="text-[hsl(215,70%,60%)] shrink-0" />}
            {d.status === 'paused' && <PauseCircle size={16} className="text-[hsl(38,92%,50%)] shrink-0" />}
            <h3 className="text-[hsl(210,40%,96%)] font-semibold truncate">{d.name}</h3>
          </div>
          {d.description && (
            <p className="text-[hsl(215,20%,45%)] text-xs mt-0.5 truncate">{d.description}</p>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => onEdit(d)}
            className="p-1.5 text-[hsl(215,20%,55%)] hover:text-[hsl(210,40%,96%)] hover:bg-[hsl(217,20%,14%)] rounded-lg transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={() => onDelete(d)}
            className="p-1.5 text-[hsl(215,20%,55%)] hover:text-[hsl(0,84%,60%)] hover:bg-[hsl(0,84%,60%)]/10 rounded-lg transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* progresso */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[hsl(210,40%,96%)] font-semibold">{formatCurrency(d.current_amount)}</span>
          <span className="text-[hsl(215,20%,55%)]">de {formatCurrency(d.target_amount)}</span>
        </div>

        <div className="w-full h-2 bg-[hsl(217,20%,14%)] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isCompleted ? 'bg-[hsl(215,70%,60%)]' : 'bg-[hsl(142,71%,45%)]'}`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${statusColor}`}>
            {percent.toFixed(0)}% completo
          </span>
          {d.target_date && !isCompleted && (
            <span className="text-[hsl(215,20%,45%)] text-xs">
              até {formatDate(d.target_date)}
            </span>
          )}
        </div>
      </div>

      {/* info calculada */}
      {isActive && !isCompleted && (
        <div className="grid grid-cols-2 gap-3">
          {(d.monthly_needed ?? 0) > 0 && (
            <div className="bg-[hsl(217,20%,14%)] rounded-lg px-3 py-2">
              <p className="text-[hsl(215,20%,45%)] text-xs">Guardar/mês</p>
              <p className="text-[hsl(142,71%,45%)] font-semibold text-sm mt-0.5">
                {formatCurrency(d.monthly_needed ?? 0)}
              </p>
            </div>
          )}
          {(d.months_left ?? 0) > 0 && (
            <div className="bg-[hsl(217,20%,14%)] rounded-lg px-3 py-2">
              <p className="text-[hsl(215,20%,45%)] text-xs">Meses restantes</p>
              <p className={`font-semibold text-sm mt-0.5 ${d.on_track ? 'text-[hsl(142,71%,45%)]' : 'text-[hsl(38,92%,50%)]'}`}>
                {d.months_left} {d.on_track ? '· no prazo' : '· atrasado'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* botão aportar */}
      {isActive && (
        <button
          onClick={() => onContribute(d)}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-[hsl(142,71%,45%)]/40 text-[hsl(142,71%,45%)] text-sm font-medium hover:bg-[hsl(142,71%,45%)]/10 transition-colors"
        >
          <PlusCircle size={15} />
          Adicionar dinheiro
        </button>
      )}
    </div>
  )
}
