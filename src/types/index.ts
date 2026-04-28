export type Account = {
  id: number
  name: string
  type: 'checking' | 'savings' | 'cash' | 'investment' | 'wallet'
  initial_balance: number
  current_balance: number
  created_at: string
}

export type Category = {
  id: number
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
}

export type Transaction = {
  id: number
  account_id: number
  category_id: number
  type: 'income' | 'expense' | 'transfer' | 'saving'
  description: string
  amount: number
  transaction_date: string
  is_fixed: boolean
  is_installment: boolean
  installment_group_id?: number
  installment_number?: number
  total_installments?: number
  category_name?: string
  category_icon?: string
  notes?: string
  created_at: string
}

export type CreditCard = {
  id: number
  user_id: number
  name: string
  limit_amount: number
  closing_day: number
  due_day: number
  color: string
  icon: string
  used_amount: number
  available_amount: number
  created_at: string
}

export type CardTransaction = {
  id: number
  credit_card_id: number
  category_id: number | null
  category_name?: string
  category_icon?: string
  description: string
  amount: number
  invoice_month: number
  invoice_year: number
  installment_number: number
  total_installments: number
  installment_group_id?: number
  created_at: string
}

export type Dream = {
  id: number
  name: string
  description?: string
  target_amount: number
  current_amount: number
  target_date?: string
  priority: number
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  created_at: string
  monthly_needed?: number
  percent_complete?: number
  months_left?: number
  on_track?: boolean
}

export type DreamContribution = {
  id: number
  dream_id: number
  account_id: number
  amount: number
  contribution_date: string
  notes?: string
  created_at: string
}

export type Budget = {
  id: number
  user_id: number
  category_id: number
  category_name: string
  category_icon: string
  category_color: string
  month: number
  year: number
  limit_amount: number
  spent_amount: number
  percent_used: number
  created_at: string
}

export type BudgetAlert = {
  id: number
  category_name: string
  category_icon: string
  category_color: string
  limit_amount: number
  spent_amount: number
  percent_used: number
}

export type CategoryExpense = {
  category_id: number
  category_name: string
  category_icon: string
  category_color: string
  amount: number
  percent: number
}

export type MonthHistory = {
  month: number
  year: number
  income: number
  expense: number
  saved: number
}

export type DashboardData = {
  month: number
  year: number
  total_income: number
  total_expense: number
  total_saved: number
  balance: number
  expenses_by_category: CategoryExpense[]
  closest_dream: {
    id: number
    name: string
    target_amount: number
    current_amount: number
    percent_complete: number
    target_date?: string
  } | null
  budgets_alert: BudgetAlert[]
  monthly_history: MonthHistory[]
}
