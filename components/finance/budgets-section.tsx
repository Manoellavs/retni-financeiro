import { Plus, Wallet } from 'lucide-react'
import type { FinanceBudget } from '@/features/finance/domain/types'

const currency = (amount: number) => amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function BudgetsSection({ items, onCreate }: { items: FinanceBudget[]; onCreate: () => void }) {
  return <section className="panel section-panel"><div className="panel-heading"><div><h2>Orçamentos do mês</h2><p>Acompanhe seus limites por categoria</p></div><button className="button-primary" onClick={onCreate}><Plus size={16} /> Novo orçamento</button></div>
    {items.length ? <div className="budget-list">{items.map((budget) => { const percent = Math.min(100, budget.spent / budget.monthlyLimit * 100); const over = budget.spent > budget.monthlyLimit; return <article className="budget-card" key={budget.id}><div className="budget-card-heading"><span className="budget-symbol"><Wallet size={17} /></span><div><h3>{budget.category}</h3><p>Limite mensal</p></div><strong className={over ? 'amount-expense' : ''}>{currency(budget.monthlyLimit)}</strong></div><div className="progress-track" role="progressbar" aria-label={`Orçamento de ${budget.category}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)}><span className={over ? 'over-budget' : ''} style={{ width: `${percent}%` }} /></div><div className="budget-card-foot"><span className={over ? 'amount-expense' : ''}>{currency(budget.spent)} utilizados</span><span>{over ? `Excedido em ${currency(budget.spent - budget.monthlyLimit)}` : `${currency(budget.monthlyLimit - budget.spent)} disponíveis`}</span></div></article> })}</div> : <div className="empty-panel"><span className="empty-icon"><Wallet size={20} /></span><p>Planeje seus gastos definindo o primeiro limite mensal.</p><button className="button-primary" onClick={onCreate}>Criar orçamento <Plus size={16} /></button></div>}
  </section>
}
