import { useEffect, useState } from 'react'
import { RefreshCw, Trash2 } from 'lucide-react'
import type { RecurringTransaction } from '@/types'
import { api, ApiError } from '@/services/api'
import { formatCurrency } from '@/lib/utils'

type Props = {
  onClose: () => void
}

export default function RecurringList({ onClose }: Props) {
  const [items, setItems] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetch() }, [])

  async function fetch() {
    setLoading(true)
    try {
      const data = await api<RecurringTransaction[]>('/recurring-transactions')
      setItems(data ?? [])
    } finally {
      setLoading(false)
    }
  }

  async function toggle(id: number) {
    try {
      await api(`/recurring-transactions/${id}/toggle`, { method: 'PUT' })
      setItems(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao atualizar')
    }
  }

  async function remove(id: number) {
    try {
      await api(`/recurring-transactions/${id}`, { method: 'DELETE' })
      setItems(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao remover')
    }
  }

  function durationLabel(r: RecurringTransaction) {
    if (!r.months) return 'Todo mês'
    return `Por ${r.months} ${r.months === 1 ? 'mês' : 'meses'}`
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[hsl(210,40%,96%)] font-semibold">Recorrentes</h3>
        <button onClick={onClose} className="text-[hsl(215,20%,55%)] hover:text-[hsl(210,40%,96%)] text-sm transition-colors">
          Fechar
        </button>
      </div>

      {error && (
        <p className="text-[hsl(0,84%,60%)] text-sm bg-[hsl(0,84%,60%)]/10 border border-[hsl(0,84%,60%)]/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-[hsl(215,20%,55%)] text-sm">Carregando...</p>
      ) : items.length === 0 ? (
        <div className="text-center py-8">
          <RefreshCw size={32} className="text-[hsl(215,20%,35%)] mx-auto mb-3" />
          <p className="text-[hsl(215,20%,55%)] text-sm">Nenhuma transação recorrente.</p>
          <p className="text-[hsl(215,20%,40%)] text-xs mt-1">
            Ao criar uma transação, marque "Recorrente" para adicioná-la aqui.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map(r => (
            <div
              key={r.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-opacity ${
                r.active
                  ? 'bg-[hsl(222,20%,13%)] border-[hsl(217,20%,18%)]'
                  : 'bg-[hsl(222,20%,10%)] border-[hsl(217,20%,14%)] opacity-60'
              }`}
            >
              {/* tipo badge */}
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                r.type === 'income'
                  ? 'bg-[hsl(142,71%,45%)]/15 text-[hsl(142,71%,45%)]'
                  : 'bg-[hsl(0,84%,60%)]/15 text-[hsl(0,84%,60%)]'
              }`}>
                {r.type === 'income' ? 'Receita' : 'Despesa'}
              </span>

              {/* info */}
              <div className="flex-1 min-w-0">
                <p className="text-[hsl(210,40%,96%)] text-sm font-medium truncate">
                  {r.category_icon && <span className="mr-1">{r.category_icon}</span>}
                  {r.description}
                </p>
                <p className="text-[hsl(215,20%,55%)] text-xs mt-0.5">
                  Dia {r.day_of_month} · {durationLabel(r)} · {r.account_name}
                </p>
              </div>

              {/* valor */}
              <span className={`text-sm font-semibold shrink-0 ${
                r.type === 'income' ? 'text-[hsl(142,71%,45%)]' : 'text-[hsl(0,84%,60%)]'
              }`}>
                {formatCurrency(r.amount)}
              </span>

              {/* ações */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggle(r.id)}
                  title={r.active ? 'Pausar' : 'Ativar'}
                  className="p-1.5 rounded-lg text-[hsl(215,20%,55%)] hover:text-[hsl(142,71%,45%)] hover:bg-[hsl(142,71%,45%)]/10 transition-colors"
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  onClick={() => remove(r.id)}
                  title="Remover"
                  className="p-1.5 rounded-lg text-[hsl(215,20%,55%)] hover:text-[hsl(0,84%,60%)] hover:bg-[hsl(0,84%,60%)]/10 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
