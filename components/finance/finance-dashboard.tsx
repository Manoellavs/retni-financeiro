'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import useSWR from 'swr'
import { ArrowDownLeft, ArrowLeftRight, LayoutDashboard, LogOut, Menu, Plus, Target, Wallet, X } from 'lucide-react'
import { getFinanceSnapshot, deleteTransaction, updateGoalProgress } from '@/features/finance/application/actions'
import type { FinanceSnapshot } from '@/features/finance/domain/types'
import { authClient } from '@/lib/auth-client'
import { FinanceDialog, type DialogMode } from './finance-dialog'
import { OverviewSection } from './overview-section'

const TransactionsSection = dynamic(() => import('./transactions-section').then((module) => module.TransactionsSection), { loading: () => <div className="section-loading" aria-label="Carregando transações" /> })
const BudgetsSection = dynamic(() => import('./budgets-section').then((module) => module.BudgetsSection), { loading: () => <div className="section-loading" aria-label="Carregando orçamentos" /> })
const GoalsSection = dynamic(() => import('./goals-section').then((module) => module.GoalsSection), { loading: () => <div className="section-loading" aria-label="Carregando metas" /> })

type Section = 'Visão geral' | 'Transações' | 'Orçamentos' | 'Metas'
const navItems: { label: Section; icon: typeof LayoutDashboard }[] = [
  { label: 'Visão geral', icon: LayoutDashboard },
  { label: 'Transações', icon: ArrowLeftRight },
  { label: 'Orçamentos', icon: Wallet },
  { label: 'Metas', icon: Target },
]

function preloadSection(section: Section) {
  if (section === 'Transações') void import('./transactions-section')
  if (section === 'Orçamentos') void import('./budgets-section')
  if (section === 'Metas') void import('./goals-section')
}

export function FinanceDashboard({ initialSnapshot, user }: { initialSnapshot: FinanceSnapshot; user: { name: string; email: string } }) {
  const { data = initialSnapshot, mutate, isValidating } = useSWR<FinanceSnapshot>('finance-snapshot', getFinanceSnapshot, {
    fallbackData: initialSnapshot,
    revalidateOnFocus: false,
    dedupingInterval: 15_000,
    keepPreviousData: true,
  })
  const [activeSection, setActiveSection] = useState<Section>('Visão geral')
  const [dialog, setDialog] = useState<DialogMode | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notice, setNotice] = useState('')

  async function handleDelete(id: string) {
    const result = await deleteTransaction({ id })
    if (!result.ok) { setNotice(result.message ?? 'Não foi possível excluir o lançamento.'); return }
    await mutate()
  }

  async function handleGoalUpdate(id: string, current: number) {
    const result = await updateGoalProgress({ goalId: id, current })
    if (!result.ok) { setNotice(result.message ?? 'Não foi possível atualizar a meta.'); return }
    await mutate()
    setNotice('Progresso atualizado.')
  }

  async function handleSignOut() {
    await authClient.signOut()
    window.location.assign('/sign-in')
  }

  const firstName = user.name.trim().split(/\s+/)[0] || 'Olá'
  const dateLabel = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

  return <div className="app-shell">
    {mobileMenuOpen && <button className="mobile-scrim" aria-label="Fechar menu" onClick={() => setMobileMenuOpen(false)} />}
    <aside className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
      <a className="brand" href="/" aria-label="Retni, início"><span className="brand-mark">r</span><span>retni<span className="brand-light">.</span></span></a>
      <div className="workspace-switch"><span className="workspace-avatar">{firstName.slice(0, 1).toLocaleUpperCase('pt-BR')}</span><span className="workspace-copy"><b>{firstName}</b><small>Espaço pessoal</small></span></div>
      <span className="nav-label">MENU</span>
      <nav className="main-nav" aria-label="Navegação principal">{navItems.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${activeSection === label ? 'active' : ''}`} aria-current={activeSection === label ? 'page' : undefined} onMouseEnter={() => preloadSection(label)} onFocus={() => preloadSection(label)} onClick={() => { setActiveSection(label); setMobileMenuOpen(false) }}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{label === 'Transações' && data.transactions.length > 0 && <span className="nav-count">{data.transactions.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="privacy-card"><span className="privacy-icon"><Target size={17} /></span><b>Seus dados, sob seu controle.</b><p>Suas informações financeiras ficam privadas e protegidas.</p></div><button className="profile-row" onClick={handleSignOut}><span className="profile-avatar">{user.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toLocaleUpperCase('pt-BR')}</span><span className="profile-copy"><b>{user.name}</b><small>{user.email}</small></span><LogOut size={17} aria-hidden="true" /></button></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><button className="icon-button mobile-menu" aria-label="Abrir menu" onClick={() => setMobileMenuOpen(true)}><Menu size={20} /></button><div className="breadcrumb">Página inicial <span>/</span> <b>{activeSection}</b></div><div className="top-actions"><span className="private-pill"><span /> CONTA PRIVADA</span><button className="icon-button" aria-label="Sair da conta" onClick={handleSignOut}><LogOut size={18} /></button><span className="top-avatar">{user.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toLocaleUpperCase('pt-BR')}</span></div></header>
      <div className="content-wrap"><section className="welcome-row"><div><p className="eyebrow">{dateLabel.toLocaleUpperCase('pt-BR')}</p><h1>Olá, {firstName}</h1><p className="welcome-subtitle">Cuide do seu dinheiro no seu ritmo.</p></div><button className="button-primary" onClick={() => setDialog('transaction')}><Plus size={16} /> Novo lançamento</button></section>
        <div className="section-heading"><div><h2>{activeSection}</h2><p>{activeSection === 'Visão geral' ? 'Um retrato simples da sua vida financeira.' : `Gerencie ${activeSection.toLocaleLowerCase('pt-BR')} com tranquilidade.`}</p></div><span className={`sync-indicator ${isValidating ? 'syncing' : ''}`} aria-live="polite">{isValidating ? 'Atualizando…' : 'Dados atualizados'}</span></div>
        {activeSection === 'Visão geral' && <OverviewSection data={data} onCreate={setDialog} />}
        {activeSection === 'Transações' && <TransactionsSection items={data.transactions} onCreate={() => setDialog('transaction')} onDelete={handleDelete} />}
        {activeSection === 'Orçamentos' && <BudgetsSection items={data.budgets} onCreate={() => setDialog('budget')} />}
        {activeSection === 'Metas' && <GoalsSection items={data.goals} onCreate={() => setDialog('goal')} onUpdate={handleGoalUpdate} />}
        <footer className="app-footer"><span>© 2026 Retni</span><span><ArrowDownLeft size={14} /> Seus dados são protegidos por sessão segura</span></footer>
      </div>
    </main>
    {dialog && <FinanceDialog mode={dialog} onClose={() => setDialog(null)} onComplete={async () => { await mutate() }} />}
    {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Fechar aviso"><X size={15} /></button></div>}
  </div>
}

