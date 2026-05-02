import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, RefreshCw, Trash2 } from 'lucide-react'
import type { RecurringTransaction } from '@/types'
import { api, ApiError } from '@/services/api'
import { formatCurrency } from '@/lib/utils'
import { useAccounts } from '@/hooks/useAccounts'
import { useCategories } from '@/hooks/useCategories'

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

type Props = { month: number; year: number; onClose: () => void; defaultEditId?: number }

type EditForm = {
  description: string
  amount: string
  accountID: string
  categoryID: string
  dayOfMonth: string
  indefinite: boolean
  months: string
}

function toEditForm(r: RecurringTransaction): EditForm {
  return {
    description: r.description,
    amount: String(r.amount),
    accountID: String(r.account_id),
    categoryID: r.category_id ? String(r.category_id) : '',
    dayOfMonth: String(r.day_of_month),
    indefinite: r.months == null,
    months: r.months ? String(r.months) : '12',
  }
}

function durationLabel(r: RecurringTransaction) {
  if (!r.months) return 'Todo mês'
  return `Por ${r.months} ${r.months === 1 ? 'mês' : 'meses'}`
}

export default function RecurringList({ month, year, onClose, defaultEditId }: Props) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<RecurringTransaction | null>(null)
  const [form, setForm] = useState<EditForm | null>(null)
  const [formError, setFormError] = useState('')
  const autoStarted = useRef(false)

  const { data: accounts = [] } = useAccounts()
  const { data: allCategories = [] } = useCategories()

  const { data: items = [], isPending: loading, error } = useQuery({
    queryKey: ['recurring-transactions'],
    queryFn: () => api<RecurringTransaction[]>('/recurring-transactions').then(d => d ?? []),
  })

  useEffect(() => {
    if (defaultEditId && items.length > 0 && !autoStarted.current) {
      const target = items.find(r => r.id === defaultEditId)
      if (target) {
        autoStarted.current = true
        startEdit(target)
      }
    }
  }, [defaultEditId, items])

  const toggleMutation = useMutation({
    mutationFn: (id: number) => api(`/recurring-transactions/${id}/toggle`, { method: 'PUT' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api(`/recurring-transactions/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: object }) =>
      api(`/recurring-transactions/${id}`, { method: 'PUT', body }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] })
      // refetchType:'all' garante que meses em cache mas fora de foco também sejam invalidados
      queryClient.invalidateQueries({ queryKey: ['transactions'], refetchType: 'all' })
      setEditing(null)
      setForm(null)
    },
    onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Erro ao salvar'),
  })

  function startEdit(r: RecurringTransaction) {
    setEditing(r)
    setForm(toEditForm(r))
    setFormError('')
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editing || !form) return
    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0) { setFormError('Valor inválido'); return }
    if (!form.accountID) { setFormError('Selecione uma conta'); return }

    updateMutation.mutate({
      id: editing.id,
      body: {
        account_id: parseInt(form.accountID),
        category_id: form.categoryID ? parseInt(form.categoryID) : null,
        description: form.description,
        amount,
        day_of_month: parseInt(form.dayOfMonth) || 1,
        months: form.indefinite ? null : parseInt(form.months) || null,
        from_month: month,
        from_year: year,
      },
    })
  }

  const filteredCategories = allCategories.filter(c =>
    editing ? c.type === (editing.type === 'income' ? 'income' : 'expense') : true
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[hsl(210,40%,96%)] font-semibold">Recorrentes</h3>
        <button onClick={onClose} className="text-[hsl(215,20%,55%)] hover:text-[hsl(210,40%,96%)] text-sm transition-colors">
          Fechar
        </button>
      </div>

      {error && (
        <p className="text-[hsl(0,84%,60%)] text-sm bg-[hsl(0,84%,60%)]/10 border border-[hsl(0,84%,60%)]/20 rounded-lg px-3 py-2">
          Erro ao carregar recorrentes
        </p>
      )}

      {loading ? (
        <p className="text-[hsl(215,20%,55%)] text-sm">Carregando...</p>
      ) : items.length === 0 ? (
        <div className="text-center py-8">
          <RefreshCw size={32} className="text-[hsl(215,20%,35%)] mx-auto mb-3" />
          <p className="text-[hsl(215,20%,55%)] text-sm">Nenhuma transação recorrente.</p>
          <p className="text-[hsl(215,20%,40%)] text-xs mt-1">
            Ao criar uma transação, marque "Recorrente" para adicioná-la aqui.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map(r => (
            <div key={r.id}>
              <div
                className={`flex items-center gap-3 p-3 rounded-lg border transition-opacity ${
                  r.active
                    ? 'bg-[hsl(222,20%,13%)] border-[hsl(217,20%,18%)]'
                    : 'bg-[hsl(222,20%,10%)] border-[hsl(217,20%,14%)] opacity-60'
                }`}
              >
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                  r.type === 'income'
                    ? 'bg-[hsl(142,71%,45%)]/15 text-[hsl(142,71%,45%)]'
                    : 'bg-[hsl(0,84%,60%)]/15 text-[hsl(0,84%,60%)]'
                }`}>
                  {r.type === 'income' ? 'Receita' : 'Despesa'}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-[hsl(210,40%,96%)] text-sm font-medium truncate">
                    {r.category_icon && <span className="mr-1">{r.category_icon}</span>}
                    {r.description}
                  </p>
                  <p className="text-[hsl(215,20%,55%)] text-xs mt-0.5">
                    Dia {r.day_of_month} · {durationLabel(r)} · {r.account_name}
                  </p>
                </div>

                <span className={`text-sm font-semibold shrink-0 ${
                  r.type === 'income' ? 'text-[hsl(142,71%,45%)]' : 'text-[hsl(0,84%,60%)]'
                }`}>
                  {formatCurrency(r.amount)}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(r)}
                    title="Editar"
                    className="p-1.5 rounded-lg text-[hsl(215,20%,55%)] hover:text-[hsl(210,40%,96%)] hover:bg-[hsl(217,20%,18%)] transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => toggleMutation.mutate(r.id)}
                    title={r.active ? 'Pausar' : 'Ativar'}
                    className="p-1.5 rounded-lg text-[hsl(215,20%,55%)] hover:text-[hsl(142,71%,45%)] hover:bg-[hsl(142,71%,45%)]/10 transition-colors"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(r.id)}
                    title="Remover"
                    className="p-1.5 rounded-lg text-[hsl(215,20%,55%)] hover:text-[hsl(0,84%,60%)] hover:bg-[hsl(0,84%,60%)]/10 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* form de edição inline */}
              {editing?.id === r.id && form && (
                <form
                  onSubmit={handleSave}
                  className="mt-1 p-4 rounded-lg border border-[hsl(142,71%,45%)]/30 bg-[hsl(222,20%,9%)] flex flex-col gap-3"
                >
                  <p className="text-[hsl(215,20%,55%)] text-xs font-medium">
                    Editar recorrente — aplicar a partir de{' '}
                    <span className="text-[hsl(142,71%,45%)]">{MONTHS[month - 1]}/{year}</span>
                    {' '}(atualiza transações já geradas e futuras)
                  </p>

                  {formError && (
                    <p className="text-[hsl(0,84%,60%)] text-xs">{formError}</p>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 flex flex-col gap-1">
                      <label className="text-[hsl(215,20%,55%)] text-xs">Descrição</label>
                      <input
                        value={form.description}
                        onChange={e => setForm(f => f && ({ ...f, description: e.target.value }))}
                        required
                        className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[hsl(215,20%,55%)] text-xs">Valor (R$)</label>
                      <input
                        type="number" step="0.01" min="0.01"
                        value={form.amount}
                        onChange={e => setForm(f => f && ({ ...f, amount: e.target.value }))}
                        required
                        className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[hsl(215,20%,55%)] text-xs">Dia do mês (1–28)</label>
                      <input
                        type="number" min="1" max="28"
                        value={form.dayOfMonth}
                        onChange={e => setForm(f => f && ({ ...f, dayOfMonth: e.target.value }))}
                        className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[hsl(215,20%,55%)] text-xs">Conta</label>
                      <select
                        value={form.accountID}
                        onChange={e => setForm(f => f && ({ ...f, accountID: e.target.value }))}
                        className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] transition-colors"
                      >
                        <option value="">Selecione...</option>
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[hsl(215,20%,55%)] text-xs">Categoria</label>
                      <select
                        value={form.categoryID}
                        onChange={e => setForm(f => f && ({ ...f, categoryID: e.target.value }))}
                        className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] transition-colors"
                      >
                        <option value="">Sem categoria</option>
                        {filteredCategories.map(c => (
                          <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* duração */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[hsl(215,20%,55%)] text-xs">Duração</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio" checked={form.indefinite}
                        onChange={() => setForm(f => f && ({ ...f, indefinite: true }))}
                        className="accent-[hsl(142,71%,45%)]"
                      />
                      <span className="text-[hsl(210,40%,96%)] text-sm">Todo mês indefinidamente</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio" checked={!form.indefinite}
                        onChange={() => setForm(f => f && ({ ...f, indefinite: false }))}
                        className="accent-[hsl(142,71%,45%)]"
                      />
                      <span className="text-[hsl(210,40%,96%)] text-sm">Por</span>
                      <input
                        type="number" min="1" max="120"
                        value={form.months}
                        disabled={form.indefinite}
                        onChange={e => setForm(f => f && ({ ...f, months: e.target.value }))}
                        className="bg-[hsl(217,20%,14%)] border border-[hsl(217,20%,18%)] rounded-lg px-2 py-1 text-[hsl(210,40%,96%)] text-sm outline-none focus:border-[hsl(142,71%,45%)] w-16 transition-colors disabled:opacity-40"
                      />
                      <span className="text-[hsl(210,40%,96%)] text-sm">meses</span>
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setEditing(null); setForm(null) }}
                      className="flex-1 py-2 rounded-lg border border-[hsl(217,20%,18%)] text-[hsl(215,20%,55%)] text-sm hover:text-[hsl(210,40%,96%)] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="flex-1 py-2 rounded-lg bg-[hsl(142,71%,45%)] text-[hsl(144,100%,6%)] font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50"
                    >
                      {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
