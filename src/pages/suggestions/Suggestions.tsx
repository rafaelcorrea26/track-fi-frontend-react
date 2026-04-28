import { useState, useEffect } from "react"
import { api } from "@/services/api"

interface Suggestion {
  type: string
  icon: string
  title: string
  message: string
}

const TYPE_STYLES: Record<string, string> = {
  warning: "bg-orange-500/10 border-orange-500/30",
  goal: "bg-primary/10 border-primary/30",
  tip: "bg-blue-500/10 border-blue-500/30",
}

export function Suggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<Suggestion[]>("/suggestions")
      .then(setSuggestions)
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sugestões</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Análise automática das suas finanças do mês atual.
        </p>
      </div>

      {loading && <p className="text-muted-foreground text-sm">Analisando...</p>}

      {!loading && suggestions.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">💡</p>
          <p>Nenhuma sugestão disponível.</p>
        </div>
      )}

      <div className="space-y-3">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className={`rounded-xl border p-4 space-y-1 ${TYPE_STYLES[s.type] ?? "bg-card border-border"}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{s.icon}</span>
              <span className="font-semibold text-sm">{s.title}</span>
            </div>
            <p className="text-sm text-muted-foreground pl-7">{s.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
