import type { Budget } from "@/types"
import { formatCurrency } from "@/lib/utils"

interface Props {
  budget: Budget
  onDelete: (id: number) => void
}

export function BudgetCategoryRow({ budget, onDelete }: Props) {
  const pct = budget.percent_used
  const barColor = pct >= 100 ? "#ef4444" : pct >= 80 ? "#f97316" : "#22c55e"

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center text-base"
            style={{ backgroundColor: (budget.category_color || "#6b7280") + "33" }}
          >
            {budget.category_icon || "💸"}
          </span>
          <div>
            <div className="font-medium text-sm">{budget.category_name || "Sem categoria"}</div>
            <div className="text-xs text-muted-foreground">
              {formatCurrency(budget.spent_amount)} de {formatCurrency(budget.limit_amount)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-sm font-bold"
            style={{ color: barColor }}
          >
            {Math.round(pct)}%
          </span>
          <button
            onClick={() => onDelete(budget.id)}
            className="text-muted-foreground hover:text-red-400 text-xs transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, pct)}%`, backgroundColor: barColor }}
        />
      </div>

      {pct >= 100 && (
        <p className="text-xs text-red-400 font-medium">
          🚨 Limite ultrapassado em {formatCurrency(budget.spent_amount - budget.limit_amount)}
        </p>
      )}
      {pct >= 80 && pct < 100 && (
        <p className="text-xs text-orange-400 font-medium">
          ⚠️ Restam apenas {formatCurrency(budget.limit_amount - budget.spent_amount)}
        </p>
      )}
    </div>
  )
}
