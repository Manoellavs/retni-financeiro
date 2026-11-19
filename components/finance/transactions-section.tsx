'use client'

import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react'
import type { FinanceTransaction } from '@/features/finance/domain/types'

const currency = (amount: number) => amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function TransactionsSection({ items, onCreate, onDelete }: { items: FinanceTransaction[]; onCreate: () => void; onDelete: (id: string) => Promise<void> }) {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => items.filter((item) => (filter === 'all' || item.kind === filter) && `${item.description} ${item.category}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))), [items, filter, query])

  return <section className="panel table-panel">
    <div className="panel-heading"><div><h2>Todos os lançamentos</h2><p>Pesquise e organize suas entradas e saídas</p></div><button className="button-primary" onClick={onCreate}><Plus size={16} /> Novo lançamento</button></div>
    <div className="table-toolbar"><div className="filter-tabs" role="tablist" aria-label="Filtrar lançamentos">{([{ id: 'all', label: 'Todos' }, { id: 'income', label: 'Entradas' }, { id: 'expense', label: 'Saídas' }] as const).map((tab) => <button key={tab.id} role="tab" aria-selected={filter === tab.id} className={filter === tab.id ? 'selected' : ''} onClick={() => setFilter(tab.id)}>{tab.label}</button>)}</div><label className="search-box"><Search size={16} /><span className="sr-only">Buscar lançamento</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por descrição ou categoria" /></label></div>
    {filtered.length ? <div className="transaction-table"><div className="table-head"><span>DESCRIÇÃO</span><span>CATEGORIA</span><span>DATA</span><span>VALOR</span><span className="sr-only">Ações</span></div>{filtered.map((item) => <article className="table-row" key={item.id}><div className="table-description"><span className={`transaction-mark ${item.kind}`}>{item.kind === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}</span><b>{item.description}</b></div><span className="table-category">{item.category}</span><time dateTime={item.occurredAt}>{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(item.occurredAt))}</time><strong className={item.kind === 'income' ? 'amount-income' : 'amount-expense'}>{item.kind === 'income' ? '+' : '−'} {currency(item.amount)}</strong><button className="row-action" aria-label={`Excluir lançamento ${item.description}`} onClick={() => { if (window.confirm(`Excluir o lançamento “${item.description}”?`)) void onDelete(item.id) }}><Trash2 size={16} /></button></article>)}</div> : <div className="empty-panel"><span className="empty-icon"><MoreHorizontal size={20} /></span><p>{query ? 'Nenhum lançamento corresponde à sua busca.' : 'Nenhum lançamento neste filtro ainda.'}</p>{!query && <button className="text-button" onClick={onCreate}>Adicionar lançamento <Plus size={15} /></button>}</div>}
    <p className="table-count">{filtered.length} {filtered.length === 1 ? 'lançamento' : 'lançamentos'}</p>
  </section>
}
