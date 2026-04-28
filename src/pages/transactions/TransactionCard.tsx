import { Pencil, Trash2 } from 'lucide-react'
import type { Transaction } from '@/types'
import { TX_TYPE_COLORS, TX_TYPE_LABELS, type TransactionType } from './types'
import { formatCurrency, formatDate } from '@/lib/utils'

type Props = {
  transaction: Transaction
  onEdit: (t: Transaction) => void
  onDelete: (t: Transaction) => void
}

export default function TransactionCard({ transaction: t, onEdit, onDelete }: Props) {
  const typeColor = TX_TYPE_COLORS[t.type as TransactionType] ?? 'text-[hsl(215,20%,55%)]'
  const typeLabel = TX_TYPE_LABELS[t.type as TransactionType] ?? t.type
  const isIncome = t.type === 'income'

  return (
    <div className="bg-[hsl(222,20%,11%)] border border-[hsl(217,20%,18%)] rounded-xl px-4 py-3 flex items-center gap-3">
      {/* ícone da categoria */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
        style={{ backgroundColor: 'hsl(217,20%,14%)' }}
      >
        {t.category_icon || '💸'}
      </div>

      {/* info principal */}
      <div className="flex-1 min-w-0">
        <p className="text-[hsl(210,40%,96%)] text-sm font-medium truncate">{t.description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs ${typeColor}`}>{typeLabel}</span>
          {t.category_name && (
            <span className="text-xs text-[hsl(215,20%,40%)]">· {t.category_name}</span>
          )}
          {t.is_installment && t.installment_number && t.total_installments && (
            <span className="text-xs text-[hsl(215,20%,40%)]">
              · {t.installment_number}/{t.total_installments}x
            </span>
          )}
          {t.is_fixed && (
            <span className="text-xs text-[hsl(38,92%,50%)]">· fixo</span>
          )}
        </div>
      </div>

      {/* data */}
      <span className="text-[hsl(215,20%,45%)] text-xs shrink-0 hidden sm:block">
        {formatDate(t.transaction_date)}
      </span>

      {/* valor */}
      <span className={`font-semibold text-sm shrink-0 ${isIncome ? 'text-[hsl(142,71%,45%)]' : 'text-[hsl(0,84%,60%)]'}`}>
        {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
      </span>

      {/* ações */}
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => onEdit(t)}
          className="p-1.5 text-[hsl(215,20%,55%)] hover:text-[hsl(210,40%,96%)] hover:bg-[hsl(217,20%,14%)] rounded-lg transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(t)}
          className="p-1.5 text-[hsl(215,20%,55%)] hover:text-[hsl(0,84%,60%)] hover:bg-[hsl(0,84%,60%)]/10 rounded-lg transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
