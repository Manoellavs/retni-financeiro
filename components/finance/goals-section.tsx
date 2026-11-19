'use client'

import { FormEvent, useState } from 'react'
import { CalendarDays, Plus, Target } from 'lucide-react'
import type { SavingsGoal } from '@/features/finance/domain/types'

const currency = (amount: number) => amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function GoalsSection({ items, onCreate, onUpdate }: { items: SavingsGoal[]; onCreate: () => void; onUpdate: (id: string, current: number) => Promise<void> }) {
  const [values, setValues] = useState<Record<string, string>>({})

  async function handleUpdate(event: FormEvent<HTMLFormElement>, goal: SavingsGoal) {
    event.preventDefault()
    const nativeEvent = event.nativeEvent as KeyboardEvent
    if (nativeEvent.isComposing || nativeEvent.keyCode === 229) return
    const value = Number(values[goal.id] ?? goal.current)
    if (Number.isFinite(value) && value >= 0 && value <= goal.target) await onUpdate(goal.id, value)
  }

  return <section className="panel section-panel"><div className="panel-heading"><div><h2>Metas de economia</h2><p>Transforme seus planos em conquistas</p></div><button className="button-primary" onClick={onCreate}><Plus size={16} /> Nova meta</button></div>
    {items.length ? <div className="goal-grid">{items.map((goal) => { const percent = Math.min(100, goal.current / goal.target * 100); return <article className="goal-card" key={goal.id}><div className="goal-card-top"><span className="goal-symbol"><Target size={18} /></span>{percent >= 100 && <span className="goal-complete">Concluída</span>}</div><h3>{goal.name}</h3><p className="goal-progress-copy"><strong>{currency(goal.current)}</strong><span>de {currency(goal.target)}</span></p><div className="progress-track" role="progressbar" aria-label={`Progresso da meta ${goal.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)}><span style={{ width: `${percent}%` }} /></div><div className="goal-card-foot"><span>{Math.round(percent)}% concluído</span>{goal.dueDate && <span><CalendarDays size={13} /> {new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${goal.dueDate}T12:00:00Z`))}</span>}</div><form className="goal-update" onSubmit={(event) => void handleUpdate(event, goal)}><label className="sr-only" htmlFor={`goal-current-${goal.id}`}>Valor guardado na meta {goal.name}</label><input id={`goal-current-${goal.id}`} type="number" min="0" max={goal.target} step="0.01" value={values[goal.id] ?? String(goal.current)} onChange={(event) => setValues((current) => ({ ...current, [goal.id]: event.target.value }))} /><button className="button-secondary" type="submit">Atualizar valor</button></form></article> })}</div> : <div className="empty-panel"><span className="empty-icon"><Target size={20} /></span><p>Defina uma meta para acompanhar seu próximo objetivo.</p><button className="button-primary" onClick={onCreate}>Criar primeira meta <Plus size={16} /></button></div>}
  </section>
}
