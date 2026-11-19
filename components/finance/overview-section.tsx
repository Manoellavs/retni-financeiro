import { ArrowDownLeft, ArrowUpRight, Plus, Target, Wallet } from 'lucide-react'
import type { FinanceSnapshot } from '@/features/finance/domain/types'

const currency = (amount: number) => amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const monthName = (month: string) => new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' }).format(new Date(`${month}-01T00:00:00Z`)).replace('.', '')

export function OverviewSection({ data, onCreate }: { data: FinanceSnapshot; onCreate: (mode: 'transaction' | 'budget' | 'goal') => void }) {
  const maxValue = Math.max(...data.cashflow.flatMap((item) => [item.income, item.expense]), 1)
  const recent = data.transactions.slice(0, 5)

  return <div className="section-stack">
    <section className="metric-grid" aria-label="Resumo financeiro">
      <article className="metric-card metric-primary"><div className="metric-label">Saldo acumulado <span className="metric-icon"><Wallet size={17} /></span></div><strong>{currency(data.balance)}</strong><p>Resultado dos seus lançamentos</p></article>
      <article className="metric-card"><div className="metric-label">Entradas do mês <span className="metric-icon metric-icon-income"><ArrowDownLeft size={17} /></span></div><strong>{currency(data.monthIncome)}</strong><p>Receitas registradas neste mês</p></article>
      <article className="metric-card"><div className="metric-label">Saídas do mês <span className="metric-icon metric-icon-expense"><ArrowUpRight size={17} /></span></div><strong>{currency(data.monthExpense)}</strong><p>Despesas registradas neste mês</p></article>
      <article className="metric-card"><div className="metric-label">Metas ativas <span className="metric-icon metric-icon-goal"><Target size={17} /></span></div><strong>{data.goals.length}</strong><p>{data.goals.length ? `${currency(data.goals.reduce((sum, goal) => sum + goal.current, 0))} guardados` : 'Comece criando uma meta'}</p></article>
    </section>
    <section className="overview-grid">
      <article className="panel cashflow-card"><div className="panel-heading"><div><h2>Fluxo de caixa</h2><p>Movimentações dos últimos seis meses</p></div><div className="chart-legend"><span><i className="legend-dot income-dot" />Entradas</span><span><i className="legend-dot expense-dot" />Saídas</span></div></div>
        <div className="cashflow-chart" role="img" aria-label="Gráfico de entradas e saídas dos últimos seis meses">{data.cashflow.map((item) => <div className="cashflow-month" key={item.month}><div className="cashflow-bars"><span className="cashflow-bar income-bar" style={{ height: `${Math.max(4, item.income / maxValue * 100)}%` }} title={`Entradas: ${currency(item.income)}`} /><span className="cashflow-bar expense-bar" style={{ height: `${Math.max(4, item.expense / maxValue * 100)}%` }} title={`Saídas: ${currency(item.expense)}`} /></div><span>{monthName(item.month)}</span></div>)}</div>
      </article>
      <article className="panel budget-preview"><div className="panel-heading"><div><h2>Orçamentos</h2><p>Seus limites deste mês</p></div><button className="text-button" onClick={() => onCreate('budget')}>Adicionar <Plus size={15} /></button></div>
        {data.budgets.length ? <div className="preview-list">{data.budgets.slice(0, 4).map((budget) => <div className="preview-budget" key={budget.id}><div className="preview-line"><b>{budget.category}</b><span>{currency(budget.spent)} <small>/ {currency(budget.monthlyLimit)}</small></span></div><div className="progress-track" role="progressbar" aria-label={`Orçamento de ${budget.category}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.round(budget.spent / budget.monthlyLimit * 100))}><span style={{ width: `${Math.min(100, budget.spent / budget.monthlyLimit * 100)}%` }} /></div></div>)}</div> : <div className="empty-panel"><span className="empty-icon"><Wallet size={19} /></span><p>Você ainda não criou um orçamento.</p><button className="text-button" onClick={() => onCreate('budget')}>Criar orçamento <Plus size={15} /></button></div>}
      </article>
    </section>
    <section className="panel recent-panel"><div className="panel-heading"><div><h2>Movimentações recentes</h2><p>Seus últimos lançamentos</p></div><button className="text-button" onClick={() => onCreate('transaction')}>Novo lançamento <Plus size={15} /></button></div>
      {recent.length ? <div className="recent-list">{recent.map((item) => <div className="recent-row" key={item.id}><span className={`transaction-mark ${item.kind}`}>{item.description.slice(0, 1).toLocaleUpperCase('pt-BR')}</span><span className="recent-name"><b>{item.description}</b><small>{item.category} · {new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(new Date(item.occurredAt))}</small></span><strong className={item.kind === 'income' ? 'amount-income' : 'amount-expense'}>{item.kind === 'income' ? '+' : '−'} {currency(item.amount)}</strong></div>)}</div> : <div className="empty-panel"><p>Seus lançamentos aparecerão aqui.</p><button className="button-primary" onClick={() => onCreate('transaction')}>Adicionar primeiro lançamento <Plus size={16} /></button></div>}
    </section>
  </div>
}
