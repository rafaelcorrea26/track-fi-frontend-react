import { useState } from 'react'
import {
  LayoutDashboard, ArrowLeftRight, Star, Wallet, Tag,
  CreditCard, PieChart, Lightbulb, BarChart3, MoreHorizontal,
} from 'lucide-react'
import Accounts from '@/pages/accounts/Accounts'
import Categories from '@/pages/categories/Categories'
import Transactions from '@/pages/transactions/Transactions'
import Dreams from '@/pages/dreams/Dreams'
import { CreditCards } from '@/pages/credit-cards/CreditCards'
import { Budget } from '@/pages/budget/Budget'
import { Dashboard } from '@/pages/dashboard/Dashboard'
import { Reports } from '@/pages/reports/Reports'
import { Suggestions } from '@/pages/suggestions/Suggestions'

type Tab =
  | 'dashboard'
  | 'transactions'
  | 'dreams'
  | 'accounts'
  | 'categories'
  | 'credit-cards'
  | 'budget'
  | 'reports'
  | 'suggestions'
  | 'more'

type Props = {
  onLogout: () => void
}

const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard',    label: 'Dashboard',  icon: <LayoutDashboard size={20} /> },
  { id: 'transactions', label: 'Transações', icon: <ArrowLeftRight size={20} /> },
  { id: 'dreams',       label: 'Sonhos',     icon: <Star size={20} /> },
  { id: 'accounts',     label: 'Contas',     icon: <Wallet size={20} /> },
  { id: 'categories',   label: 'Categorias', icon: <Tag size={20} /> },
  { id: 'credit-cards', label: 'Cartões',    icon: <CreditCard size={20} /> },
  { id: 'budget',       label: 'Orçamentos', icon: <PieChart size={20} /> },
  { id: 'reports',      label: 'Relatórios', icon: <BarChart3 size={20} /> },
  { id: 'suggestions',  label: 'Sugestões',  icon: <Lightbulb size={20} /> },
]

// tabs exibidas no bottom nav mobile (máximo 5: dashboard, transações, sonhos, contas, mais)
const mobileNav: Tab[] = ['dashboard', 'transactions', 'dreams', 'accounts', 'more']

// tabs que aparecem no submenu "mais" (mobile)
const moreItems: Tab[] = ['categories', 'credit-cards', 'budget', 'reports', 'suggestions']

export default function AppShell({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [showMore, setShowMore] = useState(false)

  function renderPage() {
    switch (activeTab) {
      case 'dashboard':    return <Dashboard />
      case 'accounts':     return <Accounts />
      case 'categories':   return <Categories />
      case 'transactions': return <Transactions />
      case 'dreams':       return <Dreams />
      case 'credit-cards': return <CreditCards />
      case 'budget':       return <Budget />
      case 'reports':      return <Reports />
      case 'suggestions':  return <Suggestions />
      default:             return null
    }
  }

  function selectTab(id: Tab) {
    setActiveTab(id)
    setShowMore(false)
  }

  return (
    <div className="flex h-screen bg-[hsl(222,20%,8%)] text-[hsl(210,40%,96%)]">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-[hsl(217,20%,18%)] p-4 gap-1 shrink-0">
        <div className="mb-6 px-2">
          <h1 className="text-xl font-bold text-[hsl(142,71%,45%)]">TrackFi</h1>
          <p className="text-xs text-[hsl(215,20%,55%)]">controle financeiro</p>
        </div>

        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => selectTab(item.id)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeTab === item.id
                ? 'bg-[hsl(142,71%,45%)] text-[hsl(144,100%,6%)] font-medium'
                : 'text-[hsl(215,20%,55%)] hover:text-[hsl(210,40%,96%)] hover:bg-[hsl(217,20%,14%)]'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        <div className="mt-auto">
          <button
            onClick={onLogout}
            className="w-full text-left px-3 py-2 text-sm text-[hsl(215,20%,55%)] hover:text-[hsl(0,84%,60%)] rounded-lg transition-colors"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header mobile */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[hsl(217,20%,18%)]">
          <h1 className="text-lg font-bold text-[hsl(142,71%,45%)]">TrackFi</h1>
          <button onClick={onLogout} className="text-xs text-[hsl(215,20%,55%)]">Sair</button>
        </header>

        {/* Página ativa */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderPage()}
        </main>

        {/* Bottom nav mobile */}
        <nav className="lg:hidden border-t border-[hsl(217,20%,18%)] bg-[hsl(222,20%,11%)]">
          <div className="flex">
            {mobileNav.map((id) => {
              const item = navItems.find(n => n.id === id) ?? {
                id, label: 'Mais', icon: <MoreHorizontal size={20} />,
              }
              const isActive = id === 'more' ? showMore : activeTab === id
              return (
                <button
                  key={id}
                  onClick={() => {
                    if (id === 'more') setShowMore(p => !p)
                    else selectTab(id)
                  }}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs transition-colors ${
                    isActive ? 'text-[hsl(142,71%,45%)]' : 'text-[hsl(215,20%,55%)]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* Submenu "mais" */}
          {showMore && (
            <div className="grid grid-cols-3 gap-2 p-3 border-t border-[hsl(217,20%,18%)]">
              {moreItems.map(id => {
                const item = navItems.find(n => n.id === id)!
                return (
                  <button
                    key={id}
                    onClick={() => selectTab(id)}
                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs transition-colors ${
                      activeTab === id
                        ? 'bg-[hsl(142,71%,45%)] text-[hsl(144,100%,6%)]'
                        : 'text-[hsl(215,20%,55%)] hover:bg-[hsl(217,20%,14%)]'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </nav>
      </div>
    </div>
  )
}
