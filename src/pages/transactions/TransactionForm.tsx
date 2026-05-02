import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import type { Account, Category, Transaction } from '@/types'
import { TX_TYPE_LABELS, type TransactionType } from './types'
import { api, ApiError } from '@/services/api'

type Props = {
  transaction?: Transaction
  accounts: Account[]
  categories: Category[]
  onSaved: () => void
  onCancel: () => void
}

const TYPES: TransactionType[] = ['expense', 'income', 'saving', 'transfer']

export default function TransactionForm({ transaction, accounts, categories, onSaved, onCancel }: Props) {

  const [type, setType] = useState<TransactionType>((transaction?.type as TransactionType) ?? 'expense')
  const [description, setDescription] = useState(transaction?.description ?? '')
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '')
  const [accountID, setAccountID] = useState(transaction?.account_id ? String(transaction.account_id) : '')
  const [categoryID, setCategoryID] = useState(transaction?.category_id ? String(transaction.category_id) : '')
  const [date, setDate] = useState(transaction?.transaction_date ?? new Date().toISOString().split('T')[0])
  const [isFixed, setIsFixed] = useState(transaction?.is_fixed ?? false)
  const [isInstallment, setIsInstallment] = useState(false)
  const [totalInstallments, setTotalInstallments] = useState('2')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringDay, setRecurringDay] = useState(() => {
    const dateStr = transaction?.transaction_date ?? new Date().toISOString().split('T')[0]
    const d = parseInt(dateStr.split('-')[2])
    return String(d > 28 ? 28 : d)
  })
  const [recurringMonths, setRecurringMonths] = useState('24')
  const [notes, setNotes] = useState(transaction?.notes ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isEdit = !!transaction

  useEffect(() => {
    const d = parseInt(date.split('-')[2])
    setRecurringDay(String(d > 28 ? 28 : d))
  }, [date])

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
      if (!isEdit && isRecurring) {
        await api('/recurring-transactions', {
          method: 'POST',
          body: {
            account_id: parseInt(accountID),
            category_id: categoryID ? parseInt(categoryID) : null,
            type,
            description,
            amount: parsedAmount,
            day_of_month: parseInt(recurringDay) || 1,
            months: parseInt(recurringMonths) || 24,
          },
        })
      } else {
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
          ...(isEdit && isRecurring ? {
            make_recurring: true,
            day_of_month: parseInt(recurringDay) || 1,
            months: parseInt(recurringMonths) || 24,
          } : {}),
        }
        if (isEdit) {
          await api<Transaction>(`/transactions/${transaction.id}`, { method: 'PUT', body })
        } else {
          await api('/transactions', { method: 'POST', body })
        }
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
      <div className="flex flex-col gap-2">
        {(type === 'income' || type === 'expense') && !transaction?.recurring_id && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={e => { setIsRecurring(e.target.checked); setIsInstallment(false); setIsFixed(false) }}
              className="w-4 h-4 accent-[hsl(142,71%,45%)]"
            />
            <span className="text-[hsl(215,20%,55%)] text-sm">Recorrente (gera todo mês automaticamente)</span>
          </label>
        )}
        {transaction?.recurring_id && (
          <div className="flex items-center gap-2 bg-[hsl(142,71%,45%)]/10 border border-[hsl(142,71%,45%)]/30 rounded-lg px-3 py-2">
            <RefreshCw size={13} className="text-[hsl(142,71%,45%)] shrink-0" />
            <p className="text-xs text-[hsl(142,71%,45%)]">
              Transação recorrente — editar aqui altera só esta ocorrência.
              Para mudar todas, use <strong>Recorrentes</strong> no topo da tela.
            </p>
          </div>
        )}
        {type === 'expense' && !isRecurring && !isEdit && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFixed}
              onChange={e => setIsFixed(e.target.checked)}
              className="w-4 h-4 accent-[hsl(142,71%,45%)]"
            />
            <span className="text-[hsl(215,20%,55%)] text-sm">Gasto fixo</span>
          </label>
        )}
        {type === 'expense' && !isRecurring && !isEdit && (
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

      {/* opções de recorrência */}
      {isRecurring && (
        <div className="flex flex-col gap-3 bg-[hsl(222,20%,8%)] border border-[hsl(142,71%,45%)]/20 rounded-lg p-3">
          <div className="flex flex-col gap-1">
            <label className="text-[hsl(215,20%,55%)] text-xs font-medium">Dia do mês (1–28)</label>
            <input
              type="number"
              min="1"
              max="28"
              value={recurringDay}
              onChange={e => setRecurringDay(e.target.value)}
              className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] w-24 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[hsl(215,20%,55%)] text-xs font-medium">Duração (meses)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="120"
                value={recurringMonths}
                onChange={e => setRecurringMonths(e.target.value)}
                className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] w-24 transition-colors"
              />
              <span className="text-[hsl(215,20%,45%)] text-xs">meses · máx 120 · padrão 24</span>
            </div>
            <p className="text-[hsl(215,20%,40%)] text-xs">
              Todas as {recurringMonths || 24} instâncias serão criadas agora. Você pode estender depois.
            </p>
          </div>
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
