import { Pencil, Trash2 } from 'lucide-react'
import type { Account } from '@/types'
import { ACCOUNT_TYPE_ICONS, ACCOUNT_TYPE_LABELS, type AccountType } from './types'
import { formatCurrency } from '@/lib/utils'

type Props = {
  account: Account
  onEdit: (account: Account) => void
  onDelete: (account: Account) => void
}

export default function AccountCard({ account, onEdit, onDelete }: Props) {
  const icon = ACCOUNT_TYPE_ICONS[account.type as AccountType] ?? '🏦'
  const label = ACCOUNT_TYPE_LABELS[account.type as AccountType] ?? account.type
  const isNegative = account.current_balance < 0

  return (
    <div className="bg-[hsl(222,20%,11%)] border border-[hsl(217,20%,18%)] rounded-xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-[hsl(217,20%,14%)] flex items-center justify-center text-xl shrink-0">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[hsl(210,40%,96%)] font-medium text-sm truncate">{account.name}</p>
        <p className="text-[hsl(215,20%,55%)] text-xs">{label}</p>
      </div>

      <div className="text-right shrink-0">
        <p className={`font-semibold text-sm ${isNegative ? 'text-[hsl(0,84%,60%)]' : 'text-[hsl(142,71%,45%)]'}`}>
          {formatCurrency(account.current_balance)}
        </p>
      </div>

      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => onEdit(account)}
          className="p-1.5 text-[hsl(215,20%,55%)] hover:text-[hsl(210,40%,96%)] hover:bg-[hsl(217,20%,14%)] rounded-lg transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(account)}
          className="p-1.5 text-[hsl(215,20%,55%)] hover:text-[hsl(0,84%,60%)] hover:bg-[hsl(0,84%,60%)]/10 rounded-lg transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
