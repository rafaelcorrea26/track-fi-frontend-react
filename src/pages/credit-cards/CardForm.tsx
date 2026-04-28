import { useState } from "react"
import type { CreditCard } from "@/types"
import { CARD_COLOR_OPTIONS, CARD_ICON_OPTIONS } from "./types"

interface Props {
  initial?: Partial<CreditCard>
  onSubmit: (data: Omit<CreditCard, "id" | "user_id" | "used_amount" | "available_amount" | "created_at">) => Promise<void>
  onCancel: () => void
}

export function CardForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "")
  const [limit, setLimit] = useState(String(initial?.limit_amount ?? ""))
  const [closing, setClosing] = useState(String(initial?.closing_day ?? ""))
  const [due, setDue] = useState(String(initial?.due_day ?? ""))
  const [color, setColor] = useState(initial?.color ?? CARD_COLOR_OPTIONS[0])
  const [icon, setIcon] = useState(initial?.icon ?? "💳")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!name.trim() || !limit || !closing || !due) {
      setError("Preencha todos os campos obrigatórios.")
      return
    }
    const closingNum = parseInt(closing)
    const dueNum = parseInt(due)
    if (closingNum < 1 || closingNum > 31 || dueNum < 1 || dueNum > 31) {
      setError("Dia de fechamento e vencimento devem ser entre 1 e 31.")
      return
    }
    setLoading(true)
    try {
      await onSubmit({
        name: name.trim(),
        limit_amount: parseFloat(limit),
        closing_day: closingNum,
        due_day: dueNum,
        color,
        icon,
      })
    } catch (err: any) {
      setError(err.message ?? "Erro ao salvar cartão.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">Nome do cartão</label>
        <input
          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ex: Nubank, Inter..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">Limite (R$)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={limit}
          onChange={e => setLimit(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Fechamento (dia)</label>
          <input
            type="number"
            min="1"
            max="31"
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={closing}
            onChange={e => setClosing(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Vencimento (dia)</label>
          <input
            type="number"
            min="1"
            max="31"
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={due}
            onChange={e => setDue(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">Ícone</label>
        <div className="flex gap-2 flex-wrap">
          {CARD_ICON_OPTIONS.map(ic => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic)}
              className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border-2 transition-colors ${
                icon === ic ? "border-primary bg-primary/20" : "border-border bg-card"
              }`}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">Cor</label>
        <div className="flex gap-2 flex-wrap">
          {CARD_COLOR_OPTIONS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                color === c ? "border-white scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
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
          {loading ? "Salvando..." : initial?.name ? "Salvar" : "Criar"}
        </button>
      </div>
    </form>
  )
}
