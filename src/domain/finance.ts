import { Account, Category, Goal, Movement, OTHER_COLOR } from "../types";

export function parseLocalDate(isoDateOnly: string): Date {
  const [y, m, d] = isoDateOnly.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isSameMonth(isoDate: string, reference: Date): boolean {
  const d = parseLocalDate(isoDate);
  return d.getFullYear() === reference.getFullYear() && d.getMonth() === reference.getMonth();
}

export function goalPaid(goal: Goal): number {
  return (goal.entries || []).reduce((s, e) => s + e.amount, 0);
}

export function goalRemaining(goal: Goal): number {
  return Math.max(goal.target - goalPaid(goal), 0);
}

export function goalPercent(goal: Goal): number {
  if (!goal.target || goal.target <= 0) return 0;
  return Math.min(goalPaid(goal) / goal.target, 1) * 100;
}

function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Monday of the week containing `date` (Monday-Sunday weeks). */
export function startOfWeek(date: Date): Date {
  const d = stripTime(date);
  const day = d.getDay(); // 0=Sunday..6=Saturday
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

/** Next due date for a monthly reminder (dueDay 1-31, clamped to the real last day of month). */
export function nextReminderDate(dueDay: number, today: Date): Date {
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const day = Math.min(dueDay, lastDay);
  let d = new Date(today.getFullYear(), today.getMonth(), day);
  if (d < stripTime(today)) {
    const nextMonthLastDay = new Date(today.getFullYear(), today.getMonth() + 2, 0).getDate();
    d = new Date(today.getFullYear(), today.getMonth() + 1, Math.min(dueDay, nextMonthLastDay));
  }
  return d;
}

/**
 * Balance of one account = starting balance + everything that moved in/out of it.
 * A transfer moves money between two of the user's own accounts (not real income/expense),
 * so it never changes the combined total. A pending movement (settled === false) isn't
 * real money yet, so it doesn't touch the balance.
 */
export function accountBalance(account: Account, movements: Movement[]): number {
  const delta = movements.reduce((s, m) => {
    if (m.settled === false) return s;
    if (m.kind === "transferencia") {
      if (m.fromAccountId === account.id) return s - m.amount;
      if (m.toAccountId === account.id) return s + m.amount;
      return s;
    }
    if (m.accountId !== account.id) return s;
    return s + (m.kind === "ingreso" ? m.amount : -m.amount);
  }, 0);
  return (account.startBalance || 0) + delta;
}

export function thisMonthMovements(movements: Movement[], reference: Date = new Date()): Movement[] {
  return movements.filter((m) => isSameMonth(m.date, reference));
}

export function totalIngresosMes(movements: Movement[], reference: Date = new Date()): number {
  return thisMonthMovements(movements, reference)
    .filter((m) => m.kind === "ingreso")
    .reduce((s, m) => s + m.amount, 0);
}

export function totalGastosMes(movements: Movement[], reference: Date = new Date()): number {
  return thisMonthMovements(movements, reference)
    .filter((m) => m.kind === "gasto")
    .reduce((s, m) => s + m.amount, 0);
}

export function categorySpentMes(
  categoryId: string,
  movements: Movement[],
  reference: Date = new Date()
): number {
  return thisMonthMovements(movements, reference)
    .filter((m) => m.kind === "gasto" && m.categoryId === categoryId)
    .reduce((s, m) => s + m.amount, 0);
}

export function totalAccountBalances(accounts: Account[], movements: Movement[]): number {
  return accounts.reduce((s, a) => s + accountBalance(a, movements), 0);
}

/** Real balance + everything still pending, as if it had already happened. */
export function totalIncludingPending(accounts: Account[], movements: Movement[]): number {
  const pendingDelta = movements
    .filter((m) => m.settled === false)
    .reduce((s, m) => {
      if (m.kind === "ingreso") return s + m.amount;
      if (m.kind === "gasto") return s - m.amount;
      return s;
    }, 0);
  return totalAccountBalances(accounts, movements) + pendingDelta;
}

export interface CategoryChartSlice {
  name: string;
  color: string;
  spent: number;
}

export function categoryChartData(
  categories: Category[],
  movements: Movement[],
  reference: Date = new Date()
): CategoryChartSlice[] {
  const known = categories.map((cat) => ({
    name: cat.name,
    color: cat.color,
    spent: categorySpentMes(cat.id, movements, reference),
  }));
  const knownIds = new Set(categories.map((c) => c.id));
  const otherSpent = thisMonthMovements(movements, reference)
    .filter((m) => m.kind === "gasto" && (!m.categoryId || !knownIds.has(m.categoryId)))
    .reduce((s, m) => s + m.amount, 0);
  if (otherSpent > 0) known.push({ name: "Varios", color: OTHER_COLOR, spent: otherSpent });
  return known.filter((x) => x.spent > 0).sort((a, b) => b.spent - a.spent);
}
