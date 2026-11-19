"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/session";
import {
  addBudget,
  addGoal,
  addTransaction,
  ensureDefaultTransactions,
  getSnapshotForUser,
  removeTransaction,
  setGoalProgress,
} from "../infrastructure/repository";
import {
  budgetInput,
  goalInput,
  goalProgressInput,
  transactionIdInput,
  transactionInput,
} from "../domain/validation";

export async function getFinanceSnapshot() {
  const userId = await requireUserId();
  await ensureDefaultTransactions(userId);
  return getSnapshotForUser(userId);
}

export async function createTransaction(input: unknown) {
  const userId = await requireUserId();
  const parsed = transactionInput.safeParse(input);
  if (!parsed.success)
    return { ok: false as const, message: "Confira os dados do lançamento." };
  await addTransaction(userId, parsed.data);
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteTransaction(input: unknown) {
  const userId = await requireUserId();
  const parsed = transactionIdInput.safeParse(input);
  if (!parsed.success)
    return {
      ok: false as const,
      message: "Não foi possível remover este lançamento.",
    };
  await removeTransaction(userId, parsed.data.id);
  revalidatePath("/");
  return { ok: true as const };
}

export async function createBudget(input: unknown) {
  const userId = await requireUserId();
  const parsed = budgetInput.safeParse(input);
  if (!parsed.success)
    return { ok: false as const, message: "Confira os dados do orçamento." };
  try {
    await addBudget(userId, parsed.data);
  } catch {
    return {
      ok: false as const,
      message: "Já existe um orçamento para essa categoria neste mês.",
    };
  }
  revalidatePath("/");
  return { ok: true as const };
}

export async function createGoal(input: unknown) {
  const userId = await requireUserId();
  const parsed = goalInput.safeParse(input);
  if (!parsed.success)
    return { ok: false as const, message: "Confira os dados da meta." };
  await addGoal(userId, parsed.data);
  revalidatePath("/");
  return { ok: true as const };
}

export async function updateGoalProgress(input: unknown) {
  const userId = await requireUserId();
  const parsed = goalProgressInput.safeParse(input);
  if (!parsed.success)
    return { ok: false as const, message: "Confira o valor da meta." };
  const updated = await setGoalProgress(
    userId,
    parsed.data.goalId,
    parsed.data.current,
  );
  if (!updated)
    return {
      ok: false as const,
      message: "Não foi possível atualizar esta meta.",
    };
  revalidatePath("/");
  return { ok: true as const };
}
