import { useState } from 'react'
import type { Dream } from '@/types'
import { DREAM_STATUS_LABELS, type DreamStatus } from './types'
import { api, ApiError } from '@/services/api'

type Props = {
  dream?: Dream
  onSaved: (dream: Dream) => void
  onCancel: () => void
}

export default function DreamForm({ dream, onSaved, onCancel }: Props) {
  const [name, setName] = useState(dream?.name ?? '')
  const [description, setDescription] = useState(dream?.description ?? '')
  const [targetAmount, setTargetAmount] = useState(dream ? String(dream.target_amount) : '')
  const [targetDate, setTargetDate] = useState(dream?.target_date ?? '')
  const [priority, setPriority] = useState(dream?.priority ?? 1)
  const [status, setStatus] = useState<DreamStatus>((dream?.status as DreamStatus) ?? 'active')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isEdit = !!dream

  // cálculo sugestivo de aporte mensal
  const monthlyPreview = (() => {
    const amount = parseFloat(targetAmount)
    if (!targetDate || isNaN(amount) || amount <= 0) return null
    const months = Math.ceil(
      (new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)
    )
    if (months <= 0) return null
    const remaining = amount - (dream?.current_amount ?? 0)
    return Math.ceil((remaining / months) * 100) / 100
  })()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const amount = parseFloat(targetAmount)
    if (isNaN(amount) || amount <= 0) {
      setError('Valor alvo deve ser maior que zero')
      return
    }
    setLoading(true)
    try {
      const body = { name, description, target_amount: amount, target_date: targetDate, priority, status }
      const saved = isEdit
        ? await api<Dream>(`/dreams/${dream.id}`, 'PUT', body)
        : await api<Dream>('/dreams', 'POST', body)
      onSaved(saved)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar sonho')
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
        <label className="text-[hsl(215,20%,55%)] text-xs font-medium">Nome do sonho</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ex: Viagem para Gramado, PS5..."
          required
          className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[hsl(215,20%,55%)] text-xs font-medium">Descrição (opcional)</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
          className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] transition-colors resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[hsl(215,20%,55%)] text-xs font-medium">Valor alvo (R$)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={targetAmount}
            onChange={e => setTargetAmount(e.target.value)}
            placeholder="0,00"
            required
            className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[hsl(215,20%,55%)] text-xs font-medium">Data alvo</label>
          <input
            type="date"
            value={targetDate}
            onChange={e => setTargetDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] transition-colors"
          />
        </div>
      </div>

      {/* sugestão de aporte */}
      {monthlyPreview !== null && (
        <div className="bg-[hsl(142,71%,45%)]/10 border border-[hsl(142,71%,45%)]/20 rounded-lg px-3 py-2">
          <p className="text-[hsl(142,71%,45%)] text-xs">
            Para atingir a meta, guarde aproximadamente{' '}
            <strong>R$ {monthlyPreview.toFixed(2).replace('.', ',')}/mês</strong>
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[hsl(215,20%,55%)] text-xs font-medium">Prioridade</label>
          <select
            value={priority}
            onChange={e => setPriority(Number(e.target.value))}
            className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] transition-colors"
          >
            {[1,2,3,4,5].map(p => <option key={p} value={p}>{p} — {['Urgente','Alta','Média','Baixa','Longa distância'][p-1]}</option>)}
          </select>
        </div>
        {isEdit && (
          <div className="flex flex-col gap-1">
            <label className="text-[hsl(215,20%,55%)] text-xs font-medium">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as DreamStatus)}
              className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] transition-colors"
            >
              {Object.entries(DREAM_STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2 rounded-lg border border-[hsl(217,20%,18%)] text-[hsl(215,20%,55%)] text-sm hover:text-[hsl(210,40%,96%)] transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-2 rounded-lg bg-[hsl(142,71%,45%)] text-[hsl(144,100%,6%)] font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50">
          {loading ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar sonho'}
        </button>
      </div>
    </form>
  )
}
