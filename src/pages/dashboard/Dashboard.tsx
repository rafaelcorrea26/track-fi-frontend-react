import { useState, useEffect, useCallback } from "react"
import type { DashboardData } from "@/types"
import { api } from "@/services/api"
import { formatCurrency } from "@/lib/utils"

export function Dashboard() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await api<DashboardData>(`/dashboard?month=${month}&year=${year}`)
      setData(d)
    } catch {
      /* silent */
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => { load() }, [load])

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
  const monthShort = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-full bg-card border border-border hover:bg-muted/50 text-sm flex items-center justify-center"
          >‹</button>
          <span className="text-sm font-medium min-w-28 text-center">
            {monthNames[month - 1]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-full bg-card border border-border hover:bg-muted/50 text-sm flex items-center justify-center"
          >›</button>
        </div>
      </div>

      {loading && <p className="text-muted-foreground text-sm">Carregando...</p>}

      {data && (
        <>
          {/* Cards de resumo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard label="Receitas" value={data.total_income} color="text-green-400" icon="💰" />
            <SummaryCard label="Despesas" value={data.total_expense} color="text-red-400" icon="💸" />
            <SummaryCard label="Poupança" value={data.total_saved} color="text-blue-400" icon="🏦" />
            <SummaryCard
              label="Saldo"
              value={data.balance}
              color={data.balance >= 0 ? "text-green-400" : "text-red-400"}
              icon="⚖️"
            />
          </div>

          {/* Alertas de orçamento */}
          {data.budgets_alert && data.budgets_alert.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-base font-semibold">⚠️ Alertas de Orçamento</h2>
              {data.budgets_alert.map(a => (
                <div
                  key={a.id}
                  className={`rounded-xl border px-4 py-3 flex items-center justify-between ${
                    a.percent_used >= 100
                      ? "bg-red-500/10 border-red-500/30"
                      : "bg-orange-500/10 border-orange-500/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{a.category_icon || "💸"}</span>
                    <div>
                      <div className="text-sm font-medium">{a.category_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(a.spent_amount)} / {formatCurrency(a.limit_amount)}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`font-bold text-sm ${a.percent_used >= 100 ? "text-red-400" : "text-orange-400"}`}
                  >
                    {Math.round(a.percent_used)}%
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Despesas por categoria */}
          {data.expenses_by_category && data.expenses_by_category.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold">Gastos por Categoria</h2>
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                {data.expenses_by_category.map((cat, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <span>{cat.category_icon}</span>
                        <span>{cat.category_name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-xs">{cat.percent}%</span>
                        <span className="font-medium">{formatCurrency(cat.amount)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${cat.percent}%`, backgroundColor: cat.category_color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sonho mais próximo */}
          {data.closest_dream && (
            <div className="space-y-2">
              <h2 className="text-base font-semibold">🌟 Sonho Mais Próximo</h2>
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{data.closest_dream.name}</span>
                  <span className="text-sm text-primary font-bold">
                    {data.closest_dream.percent_complete.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${data.closest_dream.percent_complete}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(data.closest_dream.current_amount)}</span>
                  <span>{formatCurrency(data.closest_dream.target_amount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Histórico mensal */}
          {data.monthly_history && data.monthly_history.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold">Histórico dos Últimos 6 Meses</h2>
              <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-xs">
                      <th className="text-left pb-2">Mês</th>
                      <th className="text-right pb-2">Receita</th>
                      <th className="text-right pb-2">Despesa</th>
                      <th className="text-right pb-2">Poupança</th>
                      <th className="text-right pb-2">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.monthly_history.map((h, i) => {
                      const balance = h.income - h.expense - h.saved
                      return (
                        <tr key={i} className="text-xs">
                          <td className="py-2">{monthShort[h.month - 1]}/{h.year}</td>
                          <td className="text-right text-green-400">{formatCurrency(h.income)}</td>
                          <td className="text-right text-red-400">{formatCurrency(h.expense)}</td>
                          <td className="text-right text-blue-400">{formatCurrency(h.saved)}</td>
                          <td className={`text-right font-medium ${balance >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {formatCurrency(balance)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function SummaryCard({ label, value, color, icon }: {
  label: string; value: number; color: string; icon: string
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className={`text-lg font-bold ${color}`}>{formatCurrency(value)}</div>
    </div>
  )
}
