import { useEffect, useState } from 'react'
import type { Account, Category, Transaction } from '@/types'
import { TX_TYPE_LABELS, type TransactionType } from './types'
import { api, ApiError } from '@/services/api'

type Props = {
  transaction?: Transaction
  onSaved: () => void
  onCancel: () => void
}

const TYPES: TransactionType[] = ['expense', 'income', 'saving', 'transfer']

export default function TransactionForm({ transaction, onSaved, onCancel }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [type, setType] = useState<TransactionType>((transaction?.type as TransactionType) ?? 'expense')
  const [description, setDescription] = useState(transaction?.description ?? '')
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '')
  const [accountID, setAccountID] = useState(transaction?.account_id ? String(transaction.account_id) : '')
  const [categoryID, setCategoryID] = useState(transaction?.category_id ? String(transaction.category_id) : '')
  const [date, setDate] = useState(transaction?.transaction_date ?? new Date().toISOString().split('T')[0])
  const [isFixed, setIsFixed] = useState(transaction?.is_fixed ?? false)
  const [isInstallment, setIsInstallment] = useState(false)
  const [totalInstallments, setTotalInstallments] = useState('2')
  const [notes, setNotes] = useState(transaction?.notes ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isEdit = !!transaction

  useEffect(() => {
    api<Account[]>('/accounts').then(setAccounts).catch(() => {})
    api<Category[]>('/categories').then(setCategories).catch(() => {})
  }, [])

  const filteredCategories = categories.filter(c =>
    type === 'income' ? c.type === 'income' : c.type === 'expense'
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Valor deve ser maior que zero')
      return
    }
    if (!accountID) {
      setError('Selecione uma conta')
      return
    }

    setLoading(true)
    try {
      const body = {
        account_id: parseInt(accountID),
        category_id: categoryID ? parseInt(categoryID) : null,
        type,
        description,
        amount: parsedAmount,
        transaction_date: date,
        is_fixed: isFixed,
        is_installment: isInstallment,
        total_installments: isInstallment ? parseInt(totalInstallments) : 1,
        notes,
      }

      if (isEdit) {
        await api<Transaction>(`/transactions/${transaction.id}`, { method: 'PUT', body })
      } else {
        await api('/transactions', { method: 'POST', body })
      }

      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar transação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="bg-[hsl(0,84%,60%)]/10 border border-[hsl(0,84%,60%)]/30 text-[hsl(0,84%,60%)] text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* tipo */}
      {!isEdit && (
        <div className="grid grid-cols-2 gap-2">
          {TYPES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => { setType(t); setCategoryID('') }}
              className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                type === t
                  ? 'bg-[hsl(142,71%,45%)]/20 text-[hsl(142,71%,45%)] border-[hsl(142,71%,45%)]/40'
                  : 'border-[hsl(217,20%,18%)] text-[hsl(215,20%,55%)] hover:text-[hsl(210,40%,96%)]'
              }`}
            >
              {TX_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      )}

      {/* descrição */}
      <div className="flex flex-col gap-1">
        <label className="text-[hsl(215,20%,55%)] text-xs font-medium">Descrição</label>
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Ex: Supermercado, Salário..."
          required
          className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] transition-colors"
        />
      </div>

      {/* valor + data */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[hsl(215,20%,55%)] text-xs font-medium">Valor (R$)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0,00"
            required
            className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[hsl(215,20%,55%)] text-xs font-medium">Data</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] transition-colors"
          />
        </div>
      </div>

      {/* conta */}
      <div className="flex flex-col gap-1">
        <label className="text-[hsl(215,20%,55%)] text-xs font-medium">Conta</label>
        <select
          value={accountID}
          onChange={e => setAccountID(e.target.value)}
          className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] transition-colors"
        >
          <option value="">Selecione uma conta</option>
          {accounts.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      {/* categoria (não mostra em transfer) */}
      {type !== 'transfer' && (
        <div className="flex flex-col gap-1">
          <label className="text-[hsl(215,20%,55%)] text-xs font-medium">Categoria</label>
          <select
            value={categoryID}
            onChange={e => setCategoryID(e.target.value)}
            className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] transition-colors"
          >
            <option value="">Sem categoria</option>
            {filteredCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* checkboxes */}
      {!isEdit && (
        <div className="flex flex-col gap-2">
          {type === 'expense' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFixed}
                onChange={e => setIsFixed(e.target.checked)}
                className="w-4 h-4 accent-[hsl(142,71%,45%)]"
              />
              <span className="text-[hsl(215,20%,55%)] text-sm">Gasto fixo (recorrente)</span>
            </label>
          )}
          {type === 'expense' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isInstallment}
                onChange={e => { setIsInstallment(e.target.checked); setIsFixed(false) }}
                className="w-4 h-4 accent-[hsl(142,71%,45%)]"
              />
              <span className="text-[hsl(215,20%,55%)] text-sm">Parcelado</span>
            </label>
          )}
        </div>
      )}

      {/* parcelas */}
      {isInstallment && (
        <div className="flex flex-col gap-1">
          <label className="text-[hsl(215,20%,55%)] text-xs font-medium">
            Número de parcelas
            <span className="text-[hsl(215,20%,40%)] ml-1">
              (R$ {amount ? (parseFloat(amount) / parseInt(totalInstallments || '1')).toFixed(2) : '0,00'}/parcela)
            </span>
          </label>
          <input
            type="number"
            min="2"
            max="48"
            value={totalInstallments}
            onChange={e => setTotalInstallments(e.target.value)}
            className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] w-24 transition-colors"
          />
        </div>
      )}

      {/* observações */}
      <div className="flex flex-col gap-1">
        <label className="text-[hsl(215,20%,55%)] text-xs font-medium">Observações (opcional)</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] transition-colors resize-none"
        />
      </div>

      <div className="flex gap-2 mt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg border border-[hsl(217,20%,18%)] text-[hsl(215,20%,55%)] text-sm hover:text-[hsl(210,40%,96%)] transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 rounded-lg bg-[hsl(142,71%,45%)] text-[hsl(144,100%,6%)] font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50"
        >
          {loading ? 'Salvando...' : isEdit ? 'Salvar' : 'Adicionar'}
        </button>
      </div>
    </form>
  )
}
