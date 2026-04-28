import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import type { Dream } from '@/types'
import { api, ApiError } from '@/services/api'
import { formatCurrency } from '@/lib/utils'
import DreamCard from './DreamCard'
import DreamForm from './DreamForm'
import ContributionModal from './ContributionModal'

type Modal =
  | { type: 'create' }
  | { type: 'edit'; dream: Dream }
  | { type: 'delete'; dream: Dream }
  | { type: 'contribute'; dream: Dream }
  | null

export default function Dreams() {
  const [dreams, setDreams] = useState<Dream[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<Modal>(null)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => { fetchDreams() }, [])

  async function fetchDreams() {
    try {
      const data = await api<Dream[]>('/dreams')
      setDreams(data ?? [])
    } finally {
      setLoading(false)
    }
  }

  function handleSaved(saved: Dream) {
    setDreams(prev => {
      const exists = prev.find(d => d.id === saved.id)
      return exists ? prev.map(d => d.id === saved.id ? saved : d) : [...prev, saved]
    })
    setModal(null)
  }

  function handleContributed(updated: Dream) {
    setDreams(prev => prev.map(d => d.id === updated.id ? updated : d))
    setModal(null)
  }

  async function handleDelete() {
    if (modal?.type !== 'delete') return
    setDeleteError('')
    try {
      await api(`/dreams/${modal.dream.id}`, { method: 'DELETE' })
      setDreams(prev => prev.filter(d => d.id !== modal.dream.id))
      setModal(null)
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Erro ao remover')
    }
  }

  const active = dreams.filter(d => d.status === 'active')
  const others = dreams.filter(d => d.status !== 'active')
  const totalSaved = dreams.reduce((s, d) => s + d.current_amount, 0)
  const totalTarget = dreams.filter(d => d.status === 'active').reduce((s, d) => s + d.target_amount, 0)

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[hsl(210,40%,96%)] text-xl font-semibold">Sonhos</h2>
          {active.length > 0 && (
            <p className="text-[hsl(215,20%,55%)] text-sm mt-0.5">
              {formatCurrency(totalSaved)} guardados de {formatCurrency(totalTarget)}
            </p>
          )}
        </div>
        <button
          onClick={() => setModal({ type: 'create' })}
          className="flex items-center gap-2 bg-[hsl(142,71%,45%)] text-[hsl(144,100%,6%)] px-3 py-2 rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
        >
          <Plus size={16} />
          Novo sonho
        </button>
      </div>

      {loading ? (
        <p className="text-[hsl(215,20%,55%)] text-sm">Carregando...</p>
      ) : dreams.length === 0 ? (
        <div className="bg-[hsl(222,20%,11%)] border border-[hsl(217,20%,18%)] rounded-xl p-10 text-center">
          <p className="text-4xl mb-3">🌟</p>
          <p className="text-[hsl(210,40%,96%)] font-medium mb-1">Nenhum sonho cadastrado</p>
          <p className="text-[hsl(215,20%,55%)] text-sm mb-4">Crie seu primeiro sonho e comece a guardar para realizá-lo.</p>
          <button
            onClick={() => setModal({ type: 'create' })}
            className="text-[hsl(142,71%,45%)] text-sm hover:underline"
          >
            Criar primeiro sonho
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {active.length > 0 && (
            <div className="flex flex-col gap-3">
              {active.map(d => (
                <DreamCard
                  key={d.id}
                  dream={d}
                  onEdit={dream => setModal({ type: 'edit', dream })}
                  onDelete={dream => setModal({ type: 'delete', dream })}
                  onContribute={dream => setModal({ type: 'contribute', dream })}
                />
              ))}
            </div>
          )}

          {others.length > 0 && (
            <div>
              <h3 className="text-[hsl(215,20%,45%)] text-xs font-medium uppercase tracking-wider mb-3">
                Outros
              </h3>
              <div className="flex flex-col gap-3">
                {others.map(d => (
                  <DreamCard
                    key={d.id}
                    dream={d}
                    onEdit={dream => setModal({ type: 'edit', dream })}
                    onDelete={dream => setModal({ type: 'delete', dream })}
                    onContribute={dream => setModal({ type: 'contribute', dream })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* modal criar/editar */}
      {(modal?.type === 'create' || modal?.type === 'edit') && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(222,20%,11%)] border border-[hsl(217,20%,18%)] rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-[hsl(210,40%,96%)] font-semibold mb-4">
              {modal.type === 'create' ? 'Novo sonho' : 'Editar sonho'}
            </h3>
            <DreamForm
              dream={modal.type === 'edit' ? modal.dream : undefined}
              onSaved={handleSaved}
              onCancel={() => setModal(null)}
            />
          </div>
        </div>
      )}

      {/* modal contribuição */}
      {modal?.type === 'contribute' && (
        <ContributionModal
          dream={modal.dream}
          onContributed={handleContributed}
          onCancel={() => setModal(null)}
        />
      )}

      {/* modal deletar */}
      {modal?.type === 'delete' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(222,20%,11%)] border border-[hsl(217,20%,18%)] rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-[hsl(210,40%,96%)] font-semibold mb-2">Remover sonho</h3>
            <p className="text-[hsl(215,20%,55%)] text-sm mb-4">
              Remover <strong className="text-[hsl(210,40%,96%)]">{modal.dream.name}</strong>?
              Os aportes registrados também serão removidos.
            </p>
            {deleteError && <p className="text-[hsl(0,84%,60%)] text-sm mb-3">{deleteError}</p>}
            <div className="flex gap-2">
              <button onClick={() => setModal(null)}
                className="flex-1 py-2 rounded-lg border border-[hsl(217,20%,18%)] text-[hsl(215,20%,55%)] text-sm hover:text-[hsl(210,40%,96%)] transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete}
                className="flex-1 py-2 rounded-lg bg-[hsl(0,84%,60%)] text-white font-semibold text-sm hover:brightness-110 transition-all">
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
