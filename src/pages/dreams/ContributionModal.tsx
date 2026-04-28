import { useEffect, useState } from 'react'
import type { Account, Dream } from '@/types'
import { api, ApiError } from '@/services/api'
import { formatCurrency } from '@/lib/utils'

type Props = {
  dream: Dream
  onContributed: (updatedDream: Dream) => void
  onCancel: () => void
}

type ContribResponse = { contribution: object; dream: Dream }

export default function ContributionModal({ dream, onContributed, onCancel }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountID, setAccountID] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api<Account[]>('/accounts').then(setAccounts).catch(() => {})
  }, [])

  const remaining = dream.target_amount - dream.current_amount
  const suggestedAmount = dream.monthly_needed > 0 ? dream.monthly_needed : remaining

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
      const res = await api<ContribResponse>(
        `/dreams/${dream.id}/contributions`,
        'POST',
        { account_id: parseInt(accountID), amount: parsedAmount, contribution_date: date, notes }
      )
      onContributed(res.dream)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao registrar aporte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[hsl(222,20%,11%)] border border-[hsl(217,20%,18%)] rounded-xl p-6 w-full max-w-md">
        <h3 className="text-[hsl(210,40%,96%)] font-semibold mb-1">Adicionar dinheiro</h3>
        <p className="text-[hsl(215,20%,55%)] text-sm mb-4">
          Sonho: <span className="text-[hsl(210,40%,96%)]">{dream.name}</span>
          {' · '}Faltam <span className="text-[hsl(142,71%,45%)]">{formatCurrency(remaining)}</span>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-[hsl(0,84%,60%)]/10 border border-[hsl(0,84%,60%)]/30 text-[hsl(0,84%,60%)] text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[hsl(215,20%,55%)] text-xs font-medium">
              Valor (R$)
              {suggestedAmount > 0 && (
                <button type="button" onClick={() => setAmount(String(suggestedAmount))}
                  className="ml-2 text-[hsl(142,71%,45%)] hover:underline">
                  Usar sugerido ({formatCurrency(suggestedAmount)})
                </button>
              )}
            </label>
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
            <label className="text-[hsl(215,20%,55%)] text-xs font-medium">Descontar de</label>
            <select
              value={accountID}
              onChange={e => setAccountID(e.target.value)}
              className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] transition-colors"
            >
              <option value="">Selecione uma conta</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({formatCurrency(a.current_balance)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[hsl(215,20%,55%)] text-xs font-medium">Data</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[hsl(215,20%,55%)] text-xs font-medium">Observação (opcional)</label>
            <input
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] transition-colors"
            />
          </div>

          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onCancel}
              className="flex-1 py-2 rounded-lg border border-[hsl(217,20%,18%)] text-[hsl(215,20%,55%)] text-sm hover:text-[hsl(210,40%,96%)] transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2 rounded-lg bg-[hsl(142,71%,45%)] text-[hsl(144,100%,6%)] font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50">
              {loading ? 'Registrando...' : 'Confirmar aporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
