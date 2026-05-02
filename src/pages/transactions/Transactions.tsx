import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, RefreshCw, AlertTriangle } from 'lucide-react'
import type { Transaction, RecurringTransaction } from '@/types'
import { api, ApiError } from '@/services/api'
import { formatCurrency } from '@/lib/utils'
import { useAccounts } from '@/hooks/useAccounts'
import { useCategories } from '@/hooks/useCategories'
import type { TransactionType } from './types'
import TransactionFilters from './TransactionFilters'
import TransactionCard from './TransactionCard'
import TransactionForm from './TransactionForm'
import RecurringList from './RecurringList'

type Modal =
  | { type: 'create' }
  | { type: 'edit'; transaction: Transaction }
  | { type: 'recurring-scope'; transaction: Transaction }
  | { type: 'delete'; transaction: Transaction }
  | { type: 'delete-recurring-scope'; transaction: Transaction }
  | { type: 'recurring'; defaultEditId?: number; defaultExtendId?: number }
  | null

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

const DISMISS_KEY = 'recurring-extend-dismissed'

function getDismissed(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(DISMISS_KEY) || '[]')) }
  catch { return new Set() }
}

function saveDismissed(keys: Set<string>) {
  localStorage.setItem(DISMISS_KEY, JSON.stringify([...keys]))
}

function lastMonthOf(r: RecurringTransaction): { month: number; year: number } | null {
  if (!r.months) return null
  let m = r.start_month + r.months - 1
  let y = r.start_year
  while (m > 12) { m -= 12; y++ }
  return { month: m, year: y }
}

function dismissKey(r: RecurringTransaction): string {
  const last = lastMonthOf(r)
  return last ? `${r.id}-${last.year}-${last.month}` : `${r.id}`
}

export default function Transactions() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all')
  const [modal, setModal] = useState<Modal>(null)
  const [deleteError, setDeleteError] = useState('')
  const [dismissed, setDismissed] = useState<Set<string>>(getDismissed)

  const queryClient = useQueryClient()
  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()

  const { data: recurringTemplates = [] } = useQuery({
    queryKey: ['recurring-transactions'],
    queryFn: () => api<RecurringTransaction[]>('/recurring-transactions').then(d => d ?? []),
    staleTime: 5 * 60 * 1000,
  })

  const expiringAlerts = recurringTemplates.filter(r => {
    if (!r.active || !r.months) return false
    const last = lastMonthOf(r)
    return last?.month === month && last?.year === year && !dismissed.has(dismissKey(r))
  })

  function dismissAlert(r: RecurringTransaction) {
    const next = new Set(dismissed)
    next.add(dismissKey(r))
    setDismissed(next)
    saveDismissed(next)
  }

  const { data: transactions = [], isPending: loading } = useQuery({
    queryKey: ['transactions', month, year, typeFilter],
    queryFn: () => {
      const params = new URLSearchParams({
        month: String(month),
        year: String(year),
        ...(typeFilter !== 'all' ? { type: typeFilter } : {}),
      })
      return api<Transaction[]>(`/transactions?${params}`).then(d => d ?? [])
    },
    staleTime: 30 * 1000,
  })

  async function handleDelete() {
    if (modal?.type !== 'delete') return
    setDeleteError('')
    try {
      await api(`/transactions/${modal.transaction.id}`, { method: 'DELETE' })
      queryClient.invalidateQueries({ queryKey: ['transactions', month, year] })
      setModal(null)
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Erro ao remover')
    }
  }

  const deleteRecurringFromMutation = useMutation({
    mutationFn: ({ recurringId }: { recurringId: number }) =>
      api(`/recurring-transactions/${recurringId}/from?month=${month}&year=${year}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] })
      setModal(null)
    },
  })

  // totais do mês
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions
    .filter(t => t.type === 'expense' || t.type === 'saving')
    .reduce((s, t) => s + t.amount, 0)
  const balance = totalIncome - totalExpense

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-[hsl(210,40%,96%)] text-xl font-semibold">Transações</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModal({ type: 'recurring' })}
            className="flex items-center gap-1.5 border border-[hsl(217,20%,18%)] text-[hsl(215,20%,55%)] px-3 py-2 rounded-lg text-sm hover:text-[hsl(210,40%,96%)] transition-colors"
          >
            <RefreshCw size={14} />
            Recorrentes
          </button>
          <button
            onClick={() => setModal({ type: 'create' })}
            className="flex items-center gap-2 bg-[hsl(142,71%,45%)] text-[hsl(144,100%,6%)] px-3 py-2 rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
          >
            <Plus size={16} />
            Nova
          </button>
        </div>
      </div>

      <TransactionFilters
        month={month}
        year={year}
        typeFilter={typeFilter}
        onMonthChange={(m, y) => { setMonth(m); setYear(y) }}
        onTypeChange={setTypeFilter}
      />

      {/* alertas de recorrentes no último mês */}
      {expiringAlerts.map(r => (
        <div key={r.id} className="flex items-center gap-3 bg-[hsl(38,92%,50%)]/10 border border-[hsl(38,92%,50%)]/30 rounded-xl px-4 py-3">
          <AlertTriangle size={16} className="text-[hsl(38,92%,50%)] shrink-0" />
          <p className="flex-1 text-[hsl(38,92%,50%)] text-sm">
            <strong>{r.description}</strong> chega ao fim em {MONTHS[month - 1]}/{year}. Deseja estender?
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setModal({ type: 'recurring', defaultExtendId: r.id })}
              className="px-3 py-1 rounded-lg bg-[hsl(38,92%,50%)] text-[hsl(30,100%,6%)] text-xs font-semibold hover:brightness-110 transition-all"
            >
              Estender
            </button>
            <button
              onClick={() => dismissAlert(r)}
              className="px-3 py-1 rounded-lg border border-[hsl(38,92%,50%)]/40 text-[hsl(38,92%,50%)] text-xs hover:bg-[hsl(38,92%,50%)]/10 transition-colors"
            >
              Não
            </button>
          </div>
        </div>
      ))}

      {/* resumo do mês */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Receitas', value: totalIncome, color: 'text-[hsl(142,71%,45%)]' },
          { label: 'Despesas', value: totalExpense, color: 'text-[hsl(0,84%,60%)]' },
          { label: 'Saldo', value: balance, color: balance >= 0 ? 'text-[hsl(142,71%,45%)]' : 'text-[hsl(0,84%,60%)]' },
        ].map(item => (
          <div key={item.label} className="bg-[hsl(222,20%,11%)] border border-[hsl(217,20%,18%)] rounded-xl p-3 text-center">
            <p className="text-[hsl(215,20%,55%)] text-xs mb-1">{item.label}</p>
            <p className={`font-semibold text-sm ${item.color}`}>{formatCurrency(item.value)}</p>
          </div>
        ))}
      </div>

      {/* lista */}
      {loading ? (
        <p className="text-[hsl(215,20%,55%)] text-sm">Carregando...</p>
      ) : transactions.length === 0 ? (
        <div className="bg-[hsl(222,20%,11%)] border border-[hsl(217,20%,18%)] rounded-xl p-8 text-center">
          <p className="text-[hsl(215,20%,55%)] text-sm">Nenhuma transação neste período.</p>
          <button
            onClick={() => setModal({ type: 'create' })}
            className="mt-3 text-[hsl(142,71%,45%)] text-sm hover:underline"
          >
            Adicionar primeira transação
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {transactions.map(t => (
            <TransactionCard
              key={t.id}
              transaction={t}
              onEdit={tx => tx.recurring_id
                ? setModal({ type: 'recurring-scope', transaction: tx })
                : setModal({ type: 'edit', transaction: tx })
              }
              onDelete={tx => tx.recurring_id
                ? setModal({ type: 'delete-recurring-scope', transaction: tx })
                : setModal({ type: 'delete', transaction: tx })
              }
            />
          ))}
        </div>
      )}

      {/* modal criar/editar */}
      {(modal?.type === 'create' || modal?.type === 'edit') && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(222,20%,11%)] border border-[hsl(217,20%,18%)] rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-[hsl(210,40%,96%)] font-semibold mb-4">
              {modal.type === 'create' ? 'Nova transação' : 'Editar transação'}
            </h3>
            <TransactionForm
              transaction={modal.type === 'edit' ? modal.transaction : undefined}
              accounts={accounts}
              categories={categories}
              onSaved={() => { setModal(null); queryClient.invalidateQueries({ queryKey: ['transactions', month, year] }) }}
              onCancel={() => setModal(null)}
            />
          </div>
        </div>
      )}

      {/* modal escolha edição recorrente */}
      {modal?.type === 'recurring-scope' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(222,20%,11%)] border border-[hsl(217,20%,18%)] rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-[hsl(210,40%,96%)] font-semibold mb-1">Editar recorrente</h3>
            <p className="text-[hsl(215,20%,55%)] text-sm mb-5">
              <strong className="text-[hsl(210,40%,96%)]">{modal.transaction.description}</strong> é recorrente. O que deseja editar?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setModal({ type: 'edit', transaction: modal.transaction })}
                className="w-full py-3 rounded-lg border border-[hsl(217,20%,18%)] text-left px-4 hover:bg-[hsl(217,20%,14%)] transition-colors"
              >
                <span className="text-[hsl(210,40%,96%)] text-sm font-medium block">Só esta ocorrência</span>
                <span className="text-[hsl(215,20%,45%)] text-xs">Altera apenas {MONTHS[month - 1]}/{year}</span>
              </button>
              <button
                onClick={() => setModal({ type: 'recurring', defaultEditId: modal.transaction.recurring_id ?? undefined })}
                className="w-full py-3 rounded-lg border border-[hsl(142,71%,45%)]/30 bg-[hsl(142,71%,45%)]/10 text-left px-4 hover:bg-[hsl(142,71%,45%)]/20 transition-colors"
              >
                <span className="text-[hsl(142,71%,45%)] text-sm font-medium block">Todas a partir de {MONTHS[month - 1]}/{year}</span>
                <span className="text-[hsl(142,71%,45%)] text-xs opacity-70">Atualiza o template e os meses já gerados</span>
              </button>
            </div>
            <button
              onClick={() => setModal(null)}
              className="mt-3 w-full py-2 text-[hsl(215,20%,45%)] text-sm hover:text-[hsl(210,40%,96%)] transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* modal recorrentes */}
      {modal?.type === 'recurring' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(222,20%,11%)] border border-[hsl(217,20%,18%)] rounded-xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
            <RecurringList month={month} year={year} defaultEditId={modal.defaultEditId} defaultExtendId={modal.defaultExtendId} onClose={() => setModal(null)} />
          </div>
        </div>
      )}

      {/* modal escopo de exclusão recorrente */}
      {modal?.type === 'delete-recurring-scope' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(222,20%,11%)] border border-[hsl(217,20%,18%)] rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-[hsl(210,40%,96%)] font-semibold mb-1">Remover recorrente</h3>
            <p className="text-[hsl(215,20%,55%)] text-sm mb-5">
              <strong className="text-[hsl(210,40%,96%)]">{modal.transaction.description}</strong> é recorrente. O que deseja remover?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setModal({ type: 'delete', transaction: modal.transaction })}
                className="w-full py-3 rounded-lg border border-[hsl(217,20%,18%)] text-left px-4 hover:bg-[hsl(217,20%,14%)] transition-colors"
              >
                <span className="text-[hsl(210,40%,96%)] text-sm font-medium block">Só esta ocorrência</span>
                <span className="text-[hsl(215,20%,45%)] text-xs">Remove apenas {MONTHS[month - 1]}/{year}</span>
              </button>
              <button
                onClick={() => modal.transaction.recurring_id && deleteRecurringFromMutation.mutate({ recurringId: modal.transaction.recurring_id })}
                disabled={deleteRecurringFromMutation.isPending}
                className="w-full py-3 rounded-lg border border-[hsl(0,84%,60%)]/30 bg-[hsl(0,84%,60%)]/10 text-left px-4 hover:bg-[hsl(0,84%,60%)]/20 transition-colors disabled:opacity-50"
              >
                <span className="text-[hsl(0,84%,60%)] text-sm font-medium block">
                  {deleteRecurringFromMutation.isPending ? 'Removendo...' : `Todas a partir de ${MONTHS[month - 1]}/${year}`}
                </span>
                <span className="text-[hsl(0,84%,60%)] text-xs opacity-70">Remove as instâncias e pausa o template</span>
              </button>
            </div>
            <button
              onClick={() => setModal(null)}
              className="mt-3 w-full py-2 text-[hsl(215,20%,45%)] text-sm hover:text-[hsl(210,40%,96%)] transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* modal deletar */}
      {modal?.type === 'delete' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(222,20%,11%)] border border-[hsl(217,20%,18%)] rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-[hsl(210,40%,96%)] font-semibold mb-2">Remover transação</h3>
            <p className="text-[hsl(215,20%,55%)] text-sm mb-4">
              Remover <strong className="text-[hsl(210,40%,96%)]">{modal.transaction.description}</strong>?
            </p>
            {deleteError && <p className="text-[hsl(0,84%,60%)] text-sm mb-3">{deleteError}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2 rounded-lg border border-[hsl(217,20%,18%)] text-[hsl(215,20%,55%)] text-sm hover:text-[hsl(210,40%,96%)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 rounded-lg bg-[hsl(0,84%,60%)] text-white font-semibold text-sm hover:brightness-110 transition-all"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
