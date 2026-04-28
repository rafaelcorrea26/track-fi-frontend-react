import { useState, useEffect, useCallback } from "react"
import { api } from "@/services/api"
import { formatCurrency } from "@/lib/utils"

interface ExpenseByCategory {
  name: string
  icon: string
  color: string
  amount: number
}

interface IncomeVsExpense {
  month: number
  year: number
  income: number
  expense: number
  saved: number
  balance: number
}

interface TopExpense {
  description: string
  category_name: string
  category_icon: string
  amount: number
  date: string
}

const monthShort = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]

export function Reports() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [tab, setTab] = useState<"categories" | "history" | "top">("categories")

  const [byCategory, setByCategory] = useState<ExpenseByCategory[]>([])
  const [history, setHistory] = useState<IncomeVsExpense[]>([])
  const [top, setTop] = useState<TopExpense[]>([])
  const [loading, setLoading] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      if (tab === "categories") {
        const d = await api<{ data: ExpenseByCategory[] }>(
          `/reports/expenses-by-category?month=${month}&year=${year}`
        )
        setByCategory(d.data ?? [])
      } else if (tab === "history") {
        const d = await api<IncomeVsExpense[]>("/reports/income-vs-expense?months=12")
        setHistory(d)
      } else {
        const d = await api<{ data: TopExpense[] }>(
          `/reports/top-expenses?month=${month}&year=${year}&limit=10`
        )
        setTop(d.data ?? [])
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false)
    }
  }, [tab, month, year])

  useEffect(() => { loadData() }, [loadData])

  const monthNames = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const totalByCategory = byCategory.reduce((s, c) => s + c.amount, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Relatórios</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
        {(["categories", "history", "top"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "categories" ? "Por Categoria" : t === "history" ? "Histórico" : "Top Gastos"}
          </button>
        ))}
      </div>

      {/* Navegação de mês (exceto histórico) */}
      {tab !== "history" && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-full bg-card border border-border hover:bg-muted/50 text-sm flex items-center justify-center"
          >‹</button>
          <span className="text-sm font-semibold min-w-32 text-center">
            {monthNames[month - 1]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-full bg-card border border-border hover:bg-muted/50 text-sm flex items-center justify-center"
          >›</button>
        </div>
      )}

      {loading && <p className="text-muted-foreground text-sm">Carregando...</p>}

      {/* Por Categoria */}
      {!loading && tab === "categories" && (
        byCategory.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-3">📊</p>
            <p>Nenhuma despesa neste mês.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Total: <span className="font-bold text-foreground">{formatCurrency(totalByCategory)}</span>
            </p>
            {byCategory.map((c, i) => {
              const pct = totalByCategory > 0 ? (c.amount / totalByCategory) * 100 : 0
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <span>{c.icon}</span>
                      <span>{c.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{pct.toFixed(1)}%</span>
                      <span className="font-medium">{formatCurrency(c.amount)}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: c.color || "#6b7280" }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* Histórico 12 meses */}
      {!loading && tab === "history" && (
        history.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">Sem dados históricos.</div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs">
                  <th className="text-left pb-3">Mês</th>
                  <th className="text-right pb-3">Receita</th>
                  <th className="text-right pb-3">Despesa</th>
                  <th className="text-right pb-3">Poupança</th>
                  <th className="text-right pb-3">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history.map((h, i) => (
                  <tr key={i} className="text-xs">
                    <td className="py-2.5">{monthShort[h.month - 1]}/{h.year}</td>
                    <td className="text-right text-green-400">{formatCurrency(h.income)}</td>
                    <td className="text-right text-red-400">{formatCurrency(h.expense)}</td>
                    <td className="text-right text-blue-400">{formatCurrency(h.saved)}</td>
                    <td className={`text-right font-medium ${h.balance >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {formatCurrency(h.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Top Gastos */}
      {!loading && tab === "top" && (
        top.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-3">🏆</p>
            <p>Nenhuma despesa neste mês.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {top.map((t, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3"
              >
                <span className="text-lg font-bold text-muted-foreground w-6 text-center shrink-0">
                  {i + 1}
                </span>
                <span className="text-xl shrink-0">{t.category_icon || "💸"}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{t.description}</div>
                  <div className="text-xs text-muted-foreground">{t.category_name || "Sem categoria"}</div>
                </div>
                <span className="font-bold text-red-400 shrink-0">{formatCurrency(t.amount)}</span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
