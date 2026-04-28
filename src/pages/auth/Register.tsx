import { useState } from 'react'
import { api, ApiError } from '@/services/api'

type Props = {
  onRegistered: () => void
  onGoLogin: () => void
}

export default function Register({ onRegistered, onGoLogin }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      await api('/register', {
        method: 'POST',
        body: { name, email, password },
      })
      onRegistered()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao criar conta')
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
          <h2 className="text-lg font-semibold text-[hsl(210,40%,96%)]">Criar conta</h2>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-[hsl(215,20%,55%)] mb-1">
              Nome
            </label>
            <input
              type="text"
              autoComplete="name"
              required
              className="w-full bg-[hsl(222,20%,8%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-sm text-[hsl(210,40%,96%)] placeholder-[hsl(215,20%,35%)] focus:outline-none focus:ring-2 focus:ring-[hsl(142,71%,45%)]"
              placeholder="Seu nome"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

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
              autoComplete="new-password"
              required
              className="w-full bg-[hsl(222,20%,8%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-sm text-[hsl(210,40%,96%)] placeholder-[hsl(215,20%,35%)] focus:outline-none focus:ring-2 focus:ring-[hsl(142,71%,45%)]"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[hsl(215,20%,55%)] mb-1">
              Confirmar senha
            </label>
            <input
              type="password"
              autoComplete="new-password"
              required
              className="w-full bg-[hsl(222,20%,8%)] border border-[hsl(217,20%,18%)] rounded-lg px-3 py-2 text-sm text-[hsl(210,40%,96%)] placeholder-[hsl(215,20%,35%)] focus:outline-none focus:ring-2 focus:ring-[hsl(142,71%,45%)]"
              placeholder="••••••••"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[hsl(142,71%,45%)] text-[hsl(144,100%,6%)] font-semibold text-sm hover:bg-[hsl(142,71%,40%)] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>

          <p className="text-center text-sm text-[hsl(215,20%,55%)]">
            Já tem conta?{' '}
            <button
              type="button"
              onClick={onGoLogin}
              className="text-[hsl(142,71%,45%)] hover:underline font-medium"
            >
              Entrar
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
