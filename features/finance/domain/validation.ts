import { z } from 'zod'

const amount = z.coerce.number().positive().finite().max(9999999999)
const textField = (max: number) => z.string().trim().min(1).max(max)

export const transactionInput = z.object({
  description: textField(100),
  category: textField(40),
  amount,
  kind: z.enum(['income', 'expense']),
  occurredAt: z.iso.datetime().optional(),
})

export const budgetInput = z.object({
  category: textField(40),
  monthlyLimit: amount,
})

export const goalInput = z.object({
  name: textField(80),
  target: amount,
  dueDate: z.union([z.iso.date(), z.literal('')]).optional(),
})

export const goalProgressInput = z.object({
  goalId: z.uuid(),
  current: z.coerce.number().nonnegative().finite().max(9999999999),
})

export const transactionIdInput = z.object({ id: z.uuid() })
