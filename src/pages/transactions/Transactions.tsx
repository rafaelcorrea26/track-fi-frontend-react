import { useEffect, useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import type { Transaction } from '@/types'
import { api, ApiError } from '@/services/api'
import { formatCurrency } from '@/lib/utils'
import type { TransactionType } from './types'
import TransactionFilters from './TransactionFilters'
import TransactionCard from './TransactionCard'
import TransactionForm from './TransactionForm'
import RecurringList from './RecurringList'

type Modal =
  | { type: 'create' }
  | { type: 'edit'; transaction: Transaction }
  | { type: 'delete'; transaction: Transaction }
  | { type: 'recurring' }
  | null

export default function Transactions() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<Modal>(null)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    api(`/recurring-transactions/generate?month=${month}&year=${year}`, { method: 'POST' })
      .catch(() => {})
      .finally(() => fetchTransactions())
  }, [month, year, typeFilter])

  async function fetchTransactions() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        month: String(month),
        year: String(year),
        ...(typeFilter !== 'all' ? { type: typeFilter } : {}),
      })
      const data = await api<Transaction[]>(`/transactions?${params}`)
      setTransactions(data ?? [])
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (modal?.type !== 'delete') return
    setDeleteError('')
    try {
      await api(`/transactions/${modal.transaction.id}`, { method: 'DELETE' })
      setTransactions(prev => prev.filter(t => t.id !== modal.transaction.id))
      setModal(null)
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Erro ao remover')
    }
  }

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
              onEdit={tx => setModal({ type: 'edit', transaction: tx })}
              onDelete={tx => setModal({ type: 'delete', transaction: tx })}
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
              onSaved={() => { setModal(null); fetchTransactions() }}
              onCancel={() => setModal(null)}
            />
          </div>
        </div>
      )}

      {/* modal recorrentes */}
      {modal?.type === 'recurring' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(222,20%,11%)] border border-[hsl(217,20%,18%)] rounded-xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
            <RecurringList onClose={() => setModal(null)} />
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
