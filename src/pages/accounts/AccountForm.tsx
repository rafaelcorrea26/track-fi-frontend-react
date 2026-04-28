import { useState } from 'react'
import type { Account } from '@/types'
import { ACCOUNT_TYPE_LABELS, type AccountType } from './types'
import { api, ApiError } from '@/services/api'

type Props = {
  account?: Account
  onSaved: (account: Account) => void
  onCancel: () => void
}

export default function AccountForm({ account, onSaved, onCancel }: Props) {
  const [name, setName] = useState(account?.name ?? '')
  const [type, setType] = useState<AccountType>((account?.type as AccountType) ?? 'checking')
  const [initialBalance, setInitialBalance] = useState(
    account ? String(account.initial_balance) : '0'
  )
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isEdit = !!account

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const body = { name, type, initial_balance: parseFloat(initialBalance) || 0 }
      const saved = isEdit
        ? await api<Account>(`/accounts/${account.id}`, 'PUT', body)
        : await api<Account>('/accounts', 'POST', body)
      onSaved(saved)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar conta')
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

      <div className="flex flex-col gap-1">
        <label className="text-[hsl(215,20%,55%)] text-xs font-medium">Nome da conta</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ex: Nubank, Carteira..."
          required
          className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[hsl(215,20%,55%)] text-xs font-medium">Tipo</label>
        <select
          value={type}
          onChange={e => setType(e.target.value as AccountType)}
          className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] transition-colors"
        >
          {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {!isEdit && (
        <div className="flex flex-col gap-1">
          <label className="text-[hsl(215,20%,55%)] text-xs font-medium">Saldo inicial (R$)</label>
          <input
            type="number"
            step="0.01"
            value={initialBalance}
            onChange={e => setInitialBalance(e.target.value)}
            className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] transition-colors"
          />
        </div>
      )}

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
          {loading ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
        </button>
      </div>
    </form>
  )
}
