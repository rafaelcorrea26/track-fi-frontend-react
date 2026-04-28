import { useState } from 'react'
import { api, ApiError } from '@/services/api'

type Props = {
  onLogin: (token: string) => void
  onGoRegister: () => void
}

export default function Login({ onLogin, onGoRegister }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api<{ token: string }>('/login', {
        method: 'POST',
        body: { email, password },
      })
      onLogin(data.token)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao entrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(222,20%,8%)] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[hsl(142,71%,45%)]">TrackFi</h1>
          <p className="text-[hsl(215,20%,55%)] text-sm mt-1">
            Controlar gastos hoje para realizar sonhos amanhã.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[hsl(222,20%,11%)] border border-[hsl(217,20%,18%)] rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-[hsl(210,40%,96%)]">Entrar</h2>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-[hsl(215,20%,55%)] mb-1">
              E-mail
            </label>
            <input
              type="email"
              autoComplete="email"
              required
              className="w-full bg-[hsl(222,20%,8%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-sm text-[hsl(210,40%,96%)] placeholder-[hsl(215,20%,35%)] focus:outline-none focus:ring-2 focus:ring-[hsl(142,71%,45%)]"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[hsl(215,20%,55%)] mb-1">
              Senha
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              className="w-full bg-[hsl(222,20%,8%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-sm text-[hsl(210,40%,96%)] placeholder-[hsl(215,20%,35%)] focus:outline-none focus:ring-2 focus:ring-[hsl(142,71%,45%)]"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[hsl(142,71%,45%)] text-[hsl(144,100%,6%)] font-semibold text-sm hover:bg-[hsl(142,71%,40%)] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="text-center text-sm text-[hsl(215,20%,55%)]">
            Não tem conta?{' '}
            <button
              type="button"
              onClick={onGoRegister}
              className="text-[hsl(142,71%,45%)] hover:underline font-medium"
            >
              Criar conta
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
