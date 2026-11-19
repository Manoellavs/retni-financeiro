'use client'

import { FormEvent, useState } from 'react'
import { createBudget, createGoal, createTransaction } from '@/features/finance/application/actions'
import type { TransactionKind } from '@/features/finance/domain/types'
import { X } from 'lucide-react'

export type DialogMode = 'transaction' | 'budget' | 'goal'

export function FinanceDialog({ mode, onClose, onComplete }: { mode: DialogMode; onClose: () => void; onComplete: () => Promise<void> }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const title = mode === 'transaction' ? 'Novo lanÃ§amento' : mode === 'budget' ? 'Novo orÃ§amento' : 'Nova meta'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nativeEvent = event.nativeEvent as KeyboardEvent
    if (nativeEvent.isComposing || nativeEvent.keyCode === 229) return
    const data = new FormData(event.currentTarget)
    setBusy(true)
    setError('')
    let result: { ok: boolean; message?: string }

    if (mode === 'transaction') {
      const date = String(data.get('date') ?? '')
      result = await createTransaction({
        description: data.get('description'),
        category: data.get('category'),
        amount: data.get('amount'),
        kind: data.get('kind') as TransactionKind,
        ...(date ? { occurredAt: new Date(`${date}T12:00:00`).toISOString() } : {}),
      })
    } else if (mode === 'budget') {
      result = await createBudget({ category: data.get('category'), monthlyLimit: data.get('monthlyLimit') })
    } else {
      result = await createGoal({ name: data.get('name'), target: data.get('target'), dueDate: data.get('dueDate') })
    }

    if (!result.ok) {
      setError(result.message ?? 'NÃ£o foi possÃ­vel salvar. Tente novamente.')
      setBusy(false)
      return
    }
    await onComplete()
    setBusy(false)
    onClose()
  }

  return (
    <div className="dialog-scrim" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="finance-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="dialog-heading"><div><span className="section-kicker">ÃRIS FINANCE</span><h2 id="dialog-title">{title}</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="Fechar"><X size={19} /></button></div>
        <form className="dialog-form" onSubmit={handleSubmit}>
          {mode === 'transaction' && <>
            <label className="field-label">DescriÃ§Ã£o<input name="description" placeholder="Ex.: Conta de luz" required maxLength={100} autoFocus /></label>
            <div className="form-pair"><label className="field-label">Valor (R$)<input name="amount" type="number" min="0.01" max="9999999999" step="0.01" placeholder="0,00" required /></label><label className="field-label">Tipo<select name="kind" defaultValue="expense"><option value="expense">SaÃ­da</option><option value="income">Entrada</option></select></label></div>
            <div className="form-pair"><label className="field-label">Categoria<select name="category" defaultValue="AlimentaÃ§Ã£o">{['AlimentaÃ§Ã£o', 'Moradia', 'Transporte', 'Lazer', 'SaÃºde', 'EducaÃ§Ã£o', 'Renda', 'Outros'].map((category) => <option key={category}>{category}</option>)}</select></label><label className="field-label">Data<input name="date" type="date" /></label></div>
          </>}
          {mode === 'budget' && <><label className="field-label">Categoria<select name="category" defaultValue="Moradia">{['Moradia', 'AlimentaÃ§Ã£o', 'Transporte', 'Lazer', 'SaÃºde', 'EducaÃ§Ã£o', 'Outros'].map((category) => <option key={category}>{category}</option>)}</select></label><label className="field-label">Limite mensal (R$)<input name="monthlyLimit" type="number" min="0.01" max="9999999999" step="0.01" placeholder="0,00" required autoFocus /></label></>}
          {mode === 'goal' && <><label className="field-label">Nome da meta<input name="name" placeholder="Ex.: Viagem de fÃ©rias" required maxLength={80} autoFocus /></label><div className="form-pair"><label className="field-label">Valor desejado (R$)<input name="target" type="number" min="0.01" max="9999999999" step="0.01" placeholder="0,00" required /></label><label className="field-label">Prazo<input name="dueDate" type="date" /></label></div></>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="dialog-actions"><button className="button-secondary" type="button" onClick={onClose}>Cancelar</button><button className="button-primary" type="submit" disabled={busy}>{busy ? 'Salvandoâ€¦' : 'Salvar'}</button></div>
        </form>
      </section>
    </div>
  )
}

