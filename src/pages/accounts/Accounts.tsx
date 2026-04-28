import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import type { Account } from '@/types'
import { api, ApiError } from '@/services/api'
import { formatCurrency } from '@/lib/utils'
import AccountCard from './AccountCard'
import AccountForm from './AccountForm'

type Modal = { type: 'create' } | { type: 'edit'; account: Account } | { type: 'delete'; account: Account } | null

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<Modal>(null)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    fetchAccounts()
  }, [])

  async function fetchAccounts() {
    try {
      const data = await api<Account[]>('/accounts')
      setAccounts(data)
    } finally {
      setLoading(false)
    }
  }

  function handleSaved(saved: Account) {
    setAccounts(prev => {
      const exists = prev.find(a => a.id === saved.id)
      return exists ? prev.map(a => a.id === saved.id ? saved : a) : [...prev, saved]
    })
    setModal(null)
  }

  async function handleDelete() {
    if (modal?.type !== 'delete') return
    setDeleteError('')
    try {
      await api(`/accounts/${modal.account.id}`, { method: 'DELETE' })
      setAccounts(prev => prev.filter(a => a.id !== modal.account.id))
      setModal(null)
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Erro ao remover conta')
    }
  }

  const totalBalance = accounts.reduce((sum, a) => sum + a.current_balance, 0)

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[hsl(210,40%,96%)] text-xl font-semibold">Contas</h2>
          <p className="text-[hsl(215,20%,55%)] text-sm mt-0.5">
            Saldo total: <span className={totalBalance >= 0 ? 'text-[hsl(142,71%,45%)]' : 'text-[hsl(0,84%,60%)]'}>
              {formatCurrency(totalBalance)}
            </span>
          </p>
        </div>
        <button
          onClick={() => setModal({ type: 'create' })}
          className="flex items-center gap-2 bg-[hsl(142,71%,45%)] text-[hsl(144,100%,6%)] px-3 py-2 rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
        >
          <Plus size={16} />
          Nova conta
        </button>
      </div>

      {loading ? (
        <div className="text-[hsl(215,20%,55%)] text-sm">Carregando...</div>
      ) : accounts.length === 0 ? (
        <div className="bg-[hsl(222,20%,11%)] border border-[hsl(217,20%,18%)] rounded-xl p-8 text-center">
          <p className="text-[hsl(215,20%,55%)] text-sm">Nenhuma conta cadastrada.</p>
          <button
            onClick={() => setModal({ type: 'create' })}
            className="mt-3 text-[hsl(142,71%,45%)] text-sm hover:underline"
          >
            Criar primeira conta
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {accounts.map(account => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={a => setModal({ type: 'edit', account: a })}
              onDelete={a => setModal({ type: 'delete', account: a })}
            />
          ))}
        </div>
      )}

      {/* Modal criar/editar */}
      {(modal?.type === 'create' || modal?.type === 'edit') && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(222,20%,11%)] border border-[hsl(217,20%,18%)] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-[hsl(210,40%,96%)] font-semibold mb-4">
              {modal.type === 'create' ? 'Nova conta' : 'Editar conta'}
            </h3>
            <AccountForm
              account={modal.type === 'edit' ? modal.account : undefined}
              onSaved={handleSaved}
              onCancel={() => setModal(null)}
            />
          </div>
        </div>
      )}

      {/* Modal deletar */}
      {modal?.type === 'delete' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(222,20%,11%)] border border-[hsl(217,20%,18%)] rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-[hsl(210,40%,96%)] font-semibold mb-2">Remover conta</h3>
            <p className="text-[hsl(215,20%,55%)] text-sm mb-4">
              Tem certeza que deseja remover <strong className="text-[hsl(210,40%,96%)]">{modal.account.name}</strong>?
              Esta ação não pode ser desfeita.
            </p>
            {deleteError && (
              <p className="text-[hsl(0,84%,60%)] text-sm mb-3">{deleteError}</p>
            )}
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
