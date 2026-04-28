import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { Category } from '@/types'
import { api, ApiError } from '@/services/api'
import CategoryForm from './CategoryForm'

type Modal = { type: 'create'; defaultType: 'income' | 'expense' } | { type: 'edit'; category: Category } | { type: 'delete'; category: Category } | null

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<Modal>(null)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => { fetchCategories() }, [])

  async function fetchCategories() {
    try {
      const data = await api<Category[]>('/categories')
      setCategories(data)
    } finally {
      setLoading(false)
    }
  }

  function handleSaved(saved: Category) {
    setCategories(prev => {
      const exists = prev.find(c => c.id === saved.id)
      return exists ? prev.map(c => c.id === saved.id ? saved : c) : [...prev, saved]
    })
    setModal(null)
  }

  async function handleDelete() {
    if (modal?.type !== 'delete') return
    setDeleteError('')
    try {
      await api(`/categories/${modal.category.id}`, { method: 'DELETE' })
      setCategories(prev => prev.filter(c => c.id !== modal.category.id))
      setModal(null)
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Erro ao remover')
    }
  }

  const expenses = categories.filter(c => c.type === 'expense')
  const incomes = categories.filter(c => c.type === 'income')

  function CategoryList({ items, type }: { items: Category[]; type: 'income' | 'expense' }) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-sm font-semibold ${type === 'income' ? 'text-[hsl(142,71%,45%)]' : 'text-[hsl(0,84%,60%)]'}`}>
            {type === 'income' ? 'Receitas' : 'Despesas'}
          </h3>
          <button
            onClick={() => setModal({ type: 'create', defaultType: type })}
            className="flex items-center gap-1 text-[hsl(215,20%,55%)] hover:text-[hsl(210,40%,96%)] text-xs transition-colors"
          >
            <Plus size={12} />
            Adicionar
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {items.map(cat => (
            <div
              key={cat.id}
              className="bg-[hsl(222,20%,11%)] border border-[hsl(217,20%,18%)] rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0"
                style={{ backgroundColor: `${cat.color}20` }}
              >
                {cat.icon}
              </div>
              <span className="flex-1 text-[hsl(210,40%,96%)] text-sm">{cat.name}</span>
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <div className="flex gap-1">
                <button
                  onClick={() => setModal({ type: 'edit', category: cat })}
                  className="p-1.5 text-[hsl(215,20%,55%)] hover:text-[hsl(210,40%,96%)] hover:bg-[hsl(217,20%,14%)] rounded-lg transition-colors"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => setModal({ type: 'delete', category: cat })}
                  className="p-1.5 text-[hsl(215,20%,55%)] hover:text-[hsl(0,84%,60%)] hover:bg-[hsl(0,84%,60%)]/10 rounded-lg transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-[hsl(215,20%,55%)] text-xs px-1">Nenhuma categoria.</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-[hsl(210,40%,96%)] text-xl font-semibold">Categorias</h2>
        <button
          onClick={() => setModal({ type: 'create', defaultType: 'expense' })}
          className="flex items-center gap-2 bg-[hsl(142,71%,45%)] text-[hsl(144,100%,6%)] px-3 py-2 rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
        >
          <Plus size={16} />
          Nova categoria
        </button>
      </div>

      {loading ? (
        <p className="text-[hsl(215,20%,55%)] text-sm">Carregando...</p>
      ) : (
        <div className="flex flex-col gap-6">
          <CategoryList items={expenses} type="expense" />
          <CategoryList items={incomes} type="income" />
        </div>
      )}

      {(modal?.type === 'create' || modal?.type === 'edit') && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(222,20%,11%)] border border-[hsl(217,20%,18%)] rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-[hsl(210,40%,96%)] font-semibold mb-4">
              {modal.type === 'create' ? 'Nova categoria' : 'Editar categoria'}
            </h3>
            <CategoryForm
              category={modal.type === 'edit' ? modal.category : undefined}
              defaultType={modal.type === 'create' ? modal.defaultType : undefined}
              onSaved={handleSaved}
              onCancel={() => setModal(null)}
            />
          </div>
        </div>
      )}

      {modal?.type === 'delete' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(222,20%,11%)] border border-[hsl(217,20%,18%)] rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-[hsl(210,40%,96%)] font-semibold mb-2">Remover categoria</h3>
            <p className="text-[hsl(215,20%,55%)] text-sm mb-4">
              Remover <strong className="text-[hsl(210,40%,96%)]">{modal.category.name}</strong>?
              Transações vinculadas perderão a categoria.
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
