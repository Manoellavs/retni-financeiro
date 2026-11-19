export type TransactionKind = 'income' | 'expense'

export type FinanceTransaction = {
  id: string
  description: string
  category: string
  amount: number
  kind: TransactionKind
  occurredAt: string
}

export type FinanceBudget = {
  id: string
  category: string
  monthlyLimit: number
  spent: number
  month: string
}

export type SavingsGoal = {
  id: string
  name: string
  target: number
  current: number
  dueDate: string | null
}

export type CashflowMonth = {
  month: string
  income: number
  expense: number
}

export type FinanceSnapshot = {
  balance: number
  monthIncome: number
  monthExpense: number
  transactions: FinanceTransaction[]
  budgets: FinanceBudget[]
  goals: SavingsGoal[]
  cashflow: CashflowMonth[]
}
