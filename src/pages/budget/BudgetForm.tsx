import { useState, useEffect } from "react"
import type { Category } from "@/types"
import { api } from "@/services/api"

interface Props {
  month: number
  year: number
  onSubmit: (data: { category_id: number; month: number; year: number; limit_amount: number }) => Promise<void>
  onCancel: () => void
}

export function BudgetForm({ month, year, onSubmit, onCancel }: Props) {
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [limit, setLimit] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    api<Category[]>("/categories?type=expense").then(setCategories).catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!categoryId || !limit) {
      setError("Selecione uma categoria e informe o limite.")
      return
    }
    const limitNum = parseFloat(limit)
    if (limitNum <= 0) {
      setError("O limite deve ser maior que zero.")
      return
    }
    setLoading(true)
    try {
      await onSubmit({ category_id: categoryId, month, year, limit_amount: limitNum })
    } catch (err: any) {
      setError(err.message ?? "Erro ao salvar orçamento.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">Categoria</label>
        <select
          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={categoryId ?? ""}
          onChange={e => setCategoryId(e.target.value ? parseInt(e.target.value) : null)}
          required
        >
          <option value="">Selecione...</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">Limite (R$)</label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={limit}
          onChange={e => setLimit(e.target.value)}
          required
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted/50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  )
}
