import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  budgets,
  financeSeed,
  savingsGoals,
  transactions,
} from "@/lib/db/schema";
import type { FinanceSnapshot } from "../domain/types";

export async function getSnapshotForUser(
  userId: string,
): Promise<FinanceSnapshot> {
  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const nextMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );
  const chartStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1),
  );

  const [
    balanceRows,
    currentMonthRows,
    recentRows,
    budgetRows,
    spentRows,
    goalRows,
    chartRows,
  ] = await Promise.all([
    db
      .select({
        value: sql<string>`coalesce(sum(case when ${transactions.kind} = 'income' then ${transactions.amount} else -${transactions.amount} end), 0)`,
      })
      .from(transactions)
      .where(eq(transactions.userId, userId)),
    db
      .select({
        income: sql<string>`coalesce(sum(case when ${transactions.kind} = 'income' then ${transactions.amount} else 0 end), 0)`,
        expense: sql<string>`coalesce(sum(case when ${transactions.kind} = 'expense' then ${transactions.amount} else 0 end), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.occurredAt, monthStart),
          lt(transactions.occurredAt, nextMonth),
        ),
      ),
    db
      .select({
        id: transactions.id,
        description: transactions.description,
        category: transactions.category,
        amount: transactions.amount,
        kind: transactions.kind,
        occurredAt: transactions.occurredAt,
      })
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.occurredAt))
      .limit(100),
    db
      .select({
        id: budgets.id,
        category: budgets.category,
        monthlyLimit: budgets.monthlyLimit,
        month: budgets.month,
      })
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.month, monthStart.toISOString().slice(0, 7)),
        ),
      )
      .orderBy(budgets.category),
    db
      .select({
        category: transactions.category,
        amount: sql<string>`coalesce(sum(${transactions.amount}), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.kind, "expense"),
          gte(transactions.occurredAt, monthStart),
          lt(transactions.occurredAt, nextMonth),
        ),
      )
      .groupBy(transactions.category),
    db
      .select({
        id: savingsGoals.id,
        name: savingsGoals.name,
        target: savingsGoals.target,
        current: savingsGoals.current,
        dueDate: savingsGoals.dueDate,
      })
      .from(savingsGoals)
      .where(eq(savingsGoals.userId, userId))
      .orderBy(desc(savingsGoals.createdAt)),
    db
      .select({
        month: sql<string>`to_char(date_trunc('month', ${transactions.occurredAt}), 'YYYY-MM')`,
        income: sql<string>`coalesce(sum(case when ${transactions.kind} = 'income' then ${transactions.amount} else 0 end), 0)`,
        expense: sql<string>`coalesce(sum(case when ${transactions.kind} = 'expense' then ${transactions.amount} else 0 end), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.occurredAt, chartStart),
          lt(transactions.occurredAt, nextMonth),
        ),
      )
      .groupBy(sql`date_trunc('month', ${transactions.occurredAt})`)
      .orderBy(sql`date_trunc('month', ${transactions.occurredAt})`),
  ]);

  const spentByCategory = new Map(
    spentRows.map((row) => [row.category, Number(row.amount)]),
  );
  const cashflowByMonth = new Map(
    chartRows.map((row) => [
      row.month,
      { income: Number(row.income), expense: Number(row.expense) },
    ]),
  );
  const cashflow = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + index, 1),
    );
    const month = date.toISOString().slice(0, 7);
    return {
      month,
      ...(cashflowByMonth.get(month) ?? { income: 0, expense: 0 }),
    };
  });

  return {
    balance: Number(balanceRows[0]?.value ?? 0),
    monthIncome: Number(currentMonthRows[0]?.income ?? 0),
    monthExpense: Number(currentMonthRows[0]?.expense ?? 0),
    transactions: recentRows.map((row) => ({
      ...row,
      amount: Number(row.amount),
      occurredAt: row.occurredAt.toISOString(),
    })),
    budgets: budgetRows.map((row) => ({
      ...row,
      monthlyLimit: Number(row.monthlyLimit),
      spent: spentByCategory.get(row.category) ?? 0,
    })),
    goals: goalRows.map((row) => ({
      ...row,
      target: Number(row.target),
      current: Number(row.current),
    })),
    cashflow,
  };
}

export async function addTransaction(
  userId: string,
  input: {
    description: string;
    category: string;
    amount: number;
    kind: "income" | "expense";
    occurredAt?: string;
  },
) {
  await db
    .insert(transactions)
    .values({
      ...input,
      userId,
      occurredAt: input.occurredAt ? new Date(input.occurredAt) : new Date(),
    });
}

export async function removeTransaction(userId: string, id: string) {
  await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}

export async function addBudget(
  userId: string,
  input: { category: string; monthlyLimit: number },
) {
  const month = new Date().toISOString().slice(0, 7);
  await db.insert(budgets).values({ ...input, userId, month });
}

export async function addGoal(
  userId: string,
  input: { name: string; target: number; dueDate?: string },
) {
  await db
    .insert(savingsGoals)
    .values({ ...input, userId, dueDate: input.dueDate || null });
}

export async function setGoalProgress(
  userId: string,
  goalId: string,
  current: number,
) {
  const [goal] = await db
    .select({ target: savingsGoals.target })
    .from(savingsGoals)
    .where(and(eq(savingsGoals.id, goalId), eq(savingsGoals.userId, userId)))
    .limit(1);
  if (!goal || current > Number(goal.target)) return false;
  await db
    .update(savingsGoals)
    .set({ current })
    .where(and(eq(savingsGoals.id, goalId), eq(savingsGoals.userId, userId)));
  return true;
}
export async function ensureDefaultTransactions(userId: string) {
  await db.transaction(async (tx) => {
    const [seed] = await tx
      .insert(financeSeed)
      .values({ userId })
      .onConflictDoNothing()
      .returning({ userId: financeSeed.userId });

    // Se já foi inicializado, não cria lançamentos novamente.
    if (!seed) return;

    const occurredAt = new Date();

    const defaults = [
      // LAZER
      {
        description: "Aluguel Bike",
        category: "Lazer",
        amount: 80,
        kind: "expense" as const,
      },
      {
        description: "Netflix",
        category: "Lazer",
        amount: 50,
        kind: "expense" as const,
      },
      {
        description: "Ingresso Corinthians",
        category: "Lazer",
        amount: 40,
        kind: "expense" as const,
      },
      {
        description: "Hopi Hari",
        category: "Lazer",
        amount: 120,
        kind: "expense" as const,
      },

      // MORADIA
      {
        description: "Água",
        category: "Moradia",
        amount: 80,
        kind: "expense" as const,
      },
      {
        description: "Luz",
        category: "Moradia",
        amount: 370,
        kind: "expense" as const,
      },
      {
        description: "Aluguel",
        category: "Moradia",
        amount: 1800,
        kind: "expense" as const,
      },
      {
        description: "Condomínio",
        category: "Moradia",
        amount: 260,
        kind: "expense" as const,
      },

      // ALIMENTAÇÃO
      {
        description: "McDonald's",
        category: "Alimentação",
        amount: 100,
        kind: "expense" as const,
      },
      {
        description: "Madero",
        category: "Alimentação",
        amount: 147,
        kind: "expense" as const,
      },
      {
        description: "Lopes Supermercado",
        category: "Alimentação",
        amount: 340,
        kind: "expense" as const,
      },
      {
        description: "Padaria Bella Julie",
        category: "Alimentação",
        amount: 70,
        kind: "expense" as const,
      },

      // RECEITA
      {
        description: "Salário",
        category: "Renda",
        amount: 12000,
        kind: "income" as const,
      },

      // INVESTIMENTO
      {
        description: "Poupança",
        category: "Investimentos",
        amount: 3000,
        kind: "expense" as const,
      },
    ];

    await tx.insert(transactions).values(
      defaults.map((item) => ({
        ...item,
        userId,
        occurredAt,
      })),
    );
  });
}
