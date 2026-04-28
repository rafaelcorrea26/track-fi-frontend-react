export type AccountType = 'checking' | 'savings' | 'cash' | 'investment' | 'wallet'

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Conta Corrente',
  savings: 'Poupança',
  cash: 'Dinheiro',
  investment: 'Investimentos',
  wallet: 'Carteira',
}

export const ACCOUNT_TYPE_ICONS: Record<AccountType, string> = {
  checking: '🏦',
  savings: '🐷',
  cash: '💵',
  investment: '📈',
  wallet: '👛',
}
