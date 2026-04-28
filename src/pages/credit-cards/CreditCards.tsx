import { useState, useEffect, useCallback } from "react"
import type { CreditCard, CardTransaction } from "@/types"
import { api } from "@/services/api"
import { formatCurrency, formatDate } from "@/lib/utils"
import { CardForm } from "./CardForm"
import { CardTransactionForm } from "./CardTransactionForm"

export function CreditCards() {
  const [cards, setCards] = useState<CreditCard[]>([])
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null)
  const [transactions, setTransactions] = useState<CardTransaction[]>([])
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())
  const [showCardForm, setShowCardForm] = useState(false)
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null)
  const [showTxForm, setShowTxForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadCards = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api<CreditCard[]>("/credit-cards")
      setCards(data)
      if (data.length > 0 && !selectedCard) setSelectedCard(data[0])
    } catch {
      /* silent */
    } finally {
      setLoading(false)
    }
  }, [selectedCard])

  const loadTransactions = useCallback(async () => {
    if (!selectedCard) return
    try {
      const data = await api<CardTransaction[]>(
        `/credit-cards/${selectedCard.id}/transactions?month=${filterMonth}&year=${filterYear}`
      )
      setTransactions(data)
    } catch {
      setTransactions([])
    }
  }, [selectedCard, filterMonth, filterYear])

  useEffect(() => { loadCards() }, [])
  useEffect(() => { loadTransactions() }, [loadTransactions])

  async function handleCreateCard(data: Omit<CreditCard, "id" | "user_id" | "used_amount" | "available_amount" | "created_at">) {
    await api("/credit-cards", { method: "POST", body: data })
    setShowCardForm(false)
    await loadCards()
  }

  async function handleUpdateCard(data: Omit<CreditCard, "id" | "user_id" | "used_amount" | "available_amount" | "created_at">) {
    if (!editingCard) return
    await api(`/credit-cards/${editingCard.id}`, { method: "PUT", body: data })
    setEditingCard(null)
    await loadCards()
  }

  async function handleDeleteCard(card: CreditCard) {
    if (!confirm(`Excluir o cartão "${card.name}"? Todos os lançamentos serão removidos.`)) return
    await api(`/credit-cards/${card.id}`, { method: "DELETE" })
    setSelectedCard(null)
    await loadCards()
  }

  async function handleCreateTx(data: {
    description: string; amount: number; category_id: number | null
    invoice_month: number; invoice_year: number; installments: number
  }) {
    if (!selectedCard) return
    await api(`/credit-cards/${selectedCard.id}/transactions`, { method: "POST", body: data })
    setShowTxForm(false)
    await loadTransactions()
  }

  async function handleDeleteTx(txId: number) {
    if (!selectedCard) return
    if (!confirm("Excluir este lançamento?")) return
    await api(`/credit-cards/${selectedCard.id}/transactions/${txId}`, { method: "DELETE" })
    await loadTransactions()
  }

  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]
  const totalMonth = transactions.reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cartões de Crédito</h1>
        <button
          onClick={() => setShowCardForm(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + Novo Cartão
        </button>
      </div>

      {/* Modal criar cartão */}
      {(showCardForm || editingCard) && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              {editingCard ? "Editar Cartão" : "Novo Cartão"}
            </h2>
            <CardForm
              initial={editingCard ?? undefined}
              onSubmit={editingCard ? handleUpdateCard : handleCreateCard}
              onCancel={() => { setShowCardForm(false); setEditingCard(null) }}
            />
          </div>
        </div>
      )}

      {/* Modal lançamento */}
      {showTxForm && selectedCard && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Novo Lançamento — {selectedCard.name}</h2>
            <CardTransactionForm
              cardId={selectedCard.id}
              onSubmit={handleCreateTx}
              onCancel={() => setShowTxForm(false)}
            />
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : cards.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">💳</p>
          <p>Nenhum cartão cadastrado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de cartões */}
          <div className="space-y-3">
            {cards.map(card => (
              <button
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className={`w-full text-left rounded-xl p-4 border transition-all ${
                  selectedCard?.id === card.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-base"
                      style={{ backgroundColor: card.color + "33" }}
                    >
                      {card.icon}
                    </span>
                    <span className="font-medium text-sm">{card.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={e => { e.stopPropagation(); setEditingCard(card) }}
                      className="p-1 text-muted-foreground hover:text-foreground text-xs"
                    >✏️</button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteCard(card) }}
                      className="p-1 text-muted-foreground hover:text-red-400 text-xs"
                    >🗑️</button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <div className="flex justify-between">
                    <span>Limite</span>
                    <span className="font-medium text-foreground">{formatCurrency(card.limit_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Disponível</span>
                    <span className="font-medium text-green-400">{formatCurrency(card.available_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilizado</span>
                    <span className="font-medium text-red-400">{formatCurrency(card.used_amount)}</span>
                  </div>
                </div>
                {card.limit_amount > 0 && (
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (card.used_amount / card.limit_amount) * 100)}%`,
                        backgroundColor: card.color,
                      }}
                    />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Transações do cartão selecionado */}
          {selectedCard && (
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <select
                  className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                  value={filterMonth}
                  onChange={e => setFilterMonth(parseInt(e.target.value))}
                >
                  {months.map((m, i) => (
                    <option key={i + 1} value={i + 1}>{m}</option>
                  ))}
                </select>
                <input
                  type="number"
                  className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm w-24 focus:outline-none"
                  value={filterYear}
                  onChange={e => setFilterYear(parseInt(e.target.value))}
                />
                <span className="text-sm text-muted-foreground ml-auto">
                  Fatura: <span className="font-semibold text-foreground">{formatCurrency(totalMonth)}</span>
                </span>
                <button
                  onClick={() => setShowTxForm(true)}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  + Lançamento
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  Nenhum lançamento nessa fatura.
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map(tx => (
                    <div
                      key={tx.id}
                      className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{tx.category_icon || "💳"}</span>
                        <div>
                          <div className="font-medium text-sm">{tx.description}</div>
                          <div className="text-xs text-muted-foreground flex gap-2">
                            <span>{tx.category_name || "Sem categoria"}</span>
                            {tx.total_installments > 1 && (
                              <span className="text-primary">
                                {tx.installment_number}/{tx.total_installments}x
                              </span>
                            )}
                            <span>{formatDate(tx.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-red-400">{formatCurrency(tx.amount)}</span>
                        <button
                          onClick={() => handleDeleteTx(tx.id)}
                          className="text-muted-foreground hover:text-red-400 text-xs"
                        >🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
