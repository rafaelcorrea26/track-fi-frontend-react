import { useState } from "react"
import { useCategories } from "@/hooks/useCategories"
import { formatCurrency } from "@/lib/utils"

interface Props {
  cardId: number
  onSubmit: (data: {
    description: string
    amount: number
    category_id: number | null
    invoice_month: number
    invoice_year: number
    installments: number
  }) => Promise<void>
  onCancel: () => void
}

export function CardTransactionForm({ cardId: _cardId, onSubmit, onCancel }: Props) {
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [invoiceMonth, setInvoiceMonth] = useState(new Date().getMonth() + 1)
  const [invoiceYear, setInvoiceYear] = useState(new Date().getFullYear())
  const [installments, setInstallments] = useState(1)
  const { data: categories } = useCategories('expense')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const amountNum = parseFloat(amount) || 0
  const perParcel = installments > 1 ? amountNum / installments : amountNum

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!description.trim() || !amount) {
      setError("Preencha todos os campos obrigatórios.")
      return
    }
    setLoading(true)
    try {
      await onSubmit({
        description: description.trim(),
        amount: amountNum,
        category_id: categoryId,
        invoice_month: invoiceMonth,
        invoice_year: invoiceYear,
        installments,
      })
    } catch (err: any) {
      setError(err.message ?? "Erro ao adicionar lançamento.")
    } finally {
      setLoading(false)
    }
  }

  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">Descrição</label>
        <input
          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Ex: Supermercado, Netflix..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">Valor total (R$)</label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Mês da fatura</label>
          <select
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={invoiceMonth}
            onChange={e => setInvoiceMonth(parseInt(e.target.value))}
          >
            {months.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Ano</label>
          <input
            type="number"
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={invoiceYear}
            onChange={e => setInvoiceYear(parseInt(e.target.value))}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">Parcelas</label>
        <select
          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={installments}
          onChange={e => setInstallments(parseInt(e.target.value))}
        >
          {Array.from({ length: 24 }, (_, i) => i + 1).map(n => (
            <option key={n} value={n}>{n}x {n > 1 ? `de ${formatCurrency(amountNum / n)}` : "(à vista)"}</option>
          ))}
        </select>
        {installments > 1 && amountNum > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {installments}x de {formatCurrency(perParcel)} — total {formatCurrency(amountNum)}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">Categoria</label>
        <select
          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={categoryId ?? ""}
          onChange={e => setCategoryId(e.target.value ? parseInt(e.target.value) : null)}
        >
          <option value="">Sem categoria</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
          ))}
        </select>
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
          {loading ? "Salvando..." : "Adicionar"}
        </button>
      </div>
    </form>
  )
}
