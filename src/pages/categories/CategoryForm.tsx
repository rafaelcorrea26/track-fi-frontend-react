import { useState } from 'react'
import type { Category } from '@/types'
import { api, ApiError } from '@/services/api'

type Props = {
  category?: Category
  defaultType?: 'income' | 'expense'
  onSaved: (category: Category) => void
  onCancel: () => void
}

const ICONS = ['🍔','🚗','🏠','❤️','🎮','📚','🛍️','💸','💼','💻','📈','💰','✈️','🎵','🏋️','💊','🐾','🎓','🏖️','🍺']

export default function CategoryForm({ category, defaultType = 'expense', onSaved, onCancel }: Props) {
  const [name, setName] = useState(category?.name ?? '')
  const [type, setType] = useState<'income' | 'expense'>(
    (category?.type as 'income' | 'expense') ?? defaultType
  )
  const [icon, setIcon] = useState(category?.icon ?? '💰')
  const [color, setColor] = useState(category?.color ?? '#6b7280')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isEdit = !!category

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const body = { name, type, icon, color }
      const saved = isEdit
        ? await api<Category>(`/categories/${category.id}`, 'PUT', body)
        : await api<Category>('/categories', 'POST', body)
      onSaved(saved)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar categoria')
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

      {!isEdit && (
        <div className="flex gap-2">
          {(['expense', 'income'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                type === t
                  ? t === 'expense'
                    ? 'bg-[hsl(0,84%,60%)]/20 text-[hsl(0,84%,60%)] border border-[hsl(0,84%,60%)]/40'
                    : 'bg-[hsl(142,71%,45%)]/20 text-[hsl(142,71%,45%)] border border-[hsl(142,71%,45%)]/40'
                  : 'border border-[hsl(217,20%,18%)] text-[hsl(215,20%,55%)]'
              }`}
            >
              {t === 'expense' ? 'Despesa' : 'Receita'}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-[hsl(215,20%,55%)] text-xs font-medium">Nome</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ex: Alimentação"
          required
          className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] transition-colors"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[hsl(215,20%,55%)] text-xs font-medium">Ícone</label>
        <div className="flex flex-wrap gap-2">
          {ICONS.map(i => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(i)}
              className={`w-9 h-9 rounded-lg text-lg transition-colors ${
                icon === i
                  ? 'bg-[hsl(142,71%,45%)]/20 border border-[hsl(142,71%,45%)]/60'
                  : 'bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] hover:border-[hsl(217,20%,30%)]'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[hsl(215,20%,55%)] text-xs font-medium">Cor</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="w-10 h-10 rounded-lg border border-[hsl(217,20%,18%)] bg-transparent cursor-pointer"
          />
          <span className="text-[hsl(215,20%,55%)] text-sm">{color}</span>
        </div>
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
          {loading ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
        </button>
      </div>
    </form>
  )
}
