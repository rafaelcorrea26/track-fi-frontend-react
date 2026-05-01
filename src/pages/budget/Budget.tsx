import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { Budget as BudgetType } from "@/types"
import { api } from "@/services/api"
import { BudgetForm } from "./BudgetForm"
import { BudgetCategoryRow } from "./BudgetCategoryRow"

export function Budget() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()

  const { data: budgets = [], isPending: loading } = useQuery({
    queryKey: ['budgets', month, year],
    queryFn: () => api<BudgetType[]>(`/budgets?month=${month}&year=${year}`).then(d => d ?? []),
    staleTime: 60 * 1000,
  })

  async function handleUpsert(data: { category_id: number; month: number; year: number; limit_amount: number }) {
    await api("/budgets", { method: "POST", body: data })
    setShowForm(false)
    queryClient.invalidateQueries({ queryKey: ['budgets', month, year] })
  }

  async function handleDelete(id: number) {
    if (!confirm("Remover este orçamento?")) return
    await api(`/budgets/${id}`, { method: "DELETE" })
    queryClient.invalidateQueries({ queryKey: ['budgets', month, year] })
  }

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const monthNames = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]

  const overBudget = budgets.filter(b => b.percent_used >= 100).length
  const nearLimit = budgets.filter(b => b.percent_used >= 80 && b.percent_used < 100).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orçamentos</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + Novo Orçamento
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Novo Orçamento</h2>
            <BudgetForm
              month={month}
              year={year}
              onSubmit={handleUpsert}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Navegação de mês */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 rounded-full bg-card border border-border hover:bg-muted/50 text-sm flex items-center justify-center"
        >
          ‹
        </button>
        <span className="text-base font-semibold min-w-36 text-center">
          {monthNames[month - 1]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="w-8 h-8 rounded-full bg-card border border-border hover:bg-muted/50 text-sm flex items-center justify-center"
        >
          ›
        </button>
      </div>

      {/* Resumo de alertas */}
      {(overBudget > 0 || nearLimit > 0) && (
        <div className="flex gap-3">
          {overBudget > 0 && (
            <div className="flex-1 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-400">{overBudget}</p>
              <p className="text-xs text-red-400/80">limite(s) excedido(s)</p>
            </div>
          )}
          {nearLimit > 0 && (
            <div className="flex-1 bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-orange-400">{nearLimit}</p>
              <p className="text-xs text-orange-400/80">próximo(s) do limite</p>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : budgets.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">📊</p>
          <p>Nenhum orçamento para este mês.</p>
          <p className="text-sm mt-1">Crie orçamentos por categoria para controlar seus gastos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(b => (
            <BudgetCategoryRow key={b.id} budget={b} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
