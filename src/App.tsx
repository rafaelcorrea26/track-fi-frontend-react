import { useEffect, useState } from 'react'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import AppShell from '@/components/layout/AppShell'

type AuthPage = 'login' | 'register'

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [authPage, setAuthPage] = useState<AuthPage>('login')

  useEffect(() => {
    const stored = localStorage.getItem('token')
    setToken(stored)
  }, [])

  function handleLogin(t: string) {
    localStorage.setItem('token', t)
    setToken(t)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    setToken(null)
  }

  if (!token) {
    return authPage === 'login' ? (
      <Login onLogin={handleLogin} onGoRegister={() => setAuthPage('register')} />
    ) : (
      <Register onRegistered={() => setAuthPage('login')} onGoLogin={() => setAuthPage('login')} />
    )
  }

  return <AppShell onLogout={handleLogout} />
}
