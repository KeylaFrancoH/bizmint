import { AppState, Movement, SpendAdvice } from "../types";
import { isSameMonth } from "../domain/finance";

function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function monthExpenses(movements: Movement[], reference: Date): Movement[] {
  return movements.filter((m) => m.kind === "gasto" && isSameMonth(m.date, reference));
}

function sum(movements: Movement[]): number {
  return movements.reduce((total, m) => total + m.amount, 0);
}

export function effectiveMonthlyBudget(state: AppState): number {
  const { budget } = state;
  if (budget.monthlyBudget > 0) return budget.monthlyBudget;
  if (budget.monthlyIncome > 0) {
    const keep = Math.min(Math.max(budget.savingsGoalPercent, 0), 100) / 100;
    return budget.monthlyIncome * (1 - keep);
  }
  return 0;
}

const money = (n: number) => `$${n.toFixed(2)}`;

/**
 * Rule-based "can I spend this" advisor. Runs fully on-device: no network
 * call and no per-query cost, since the decision only needs arithmetic
 * over the user's own budget and spending pace.
 */
export function evaluateSpend(
  amount: number,
  categoryId: string | null,
  state: AppState,
  now: Date = new Date()
): SpendAdvice {
  const budget = effectiveMonthlyBudget(state);
  const thisMonth = monthExpenses(state.movements, now);
  const spentSoFar = sum(thisMonth);

  if (budget <= 0) {
    return {
      canSpend: true,
      confidence: "baja",
      headline: "Puedes registrarlo, pero aún no tengo datos suficientes",
      reasons: [
        "No configuraste un presupuesto ni un ingreso mensual todavía.",
        "Ve a Ajustes para que la próxima respuesta sea confiable.",
      ],
      remainingAfter: -amount,
      remainingBudgetNow: 0,
      suggestedMaxToday: 0,
    };
  }

  const dayOfMonth = now.getDate();
  const totalDays = daysInMonth(now);
  const daysRemaining = Math.max(totalDays - dayOfMonth + 1, 1);

  const remainingBudgetNow = budget - spentSoFar;
  const suggestedMaxToday = Math.max(remainingBudgetNow / daysRemaining, 0);
  const remainingAfter = remainingBudgetNow - amount;

  const category = categoryId ? state.categories.find((c) => c.id === categoryId) : undefined;
  const categoryLimit = category?.limit ?? undefined;
  const categorySpent = category
    ? sum(thisMonth.filter((m) => m.categoryId === category.id))
    : 0;
  const categoryRemaining = categoryLimit !== undefined ? categoryLimit - categorySpent : undefined;

  const reasons: string[] = [
    `Este mes llevas gastado ${money(spentSoFar)} de ${money(budget)}.`,
    `Te quedan ${money(Math.max(remainingBudgetNow, 0))} para los próximos ${daysRemaining} día(s).`,
  ];

  if (remainingBudgetNow <= 0) {
    return {
      canSpend: false,
      confidence: "alta",
      headline: "No, ya superaste tu presupuesto de este mes",
      reasons: [...reasons, "Cualquier gasto nuevo profundiza el déficit del mes."],
      remainingAfter,
      remainingBudgetNow,
      suggestedMaxToday,
    };
  }

  if (amount > remainingBudgetNow) {
    return {
      canSpend: false,
      confidence: "alta",
      headline: "No, ese gasto supera lo que te queda este mes",
      reasons: [
        ...reasons,
        `Gastar ${money(amount)} dejaría tu presupuesto en ${money(remainingAfter)}.`,
      ],
      remainingAfter,
      remainingBudgetNow,
      suggestedMaxToday,
    };
  }

  if (category && categoryRemaining !== undefined && amount > categoryRemaining) {
    const stillHealthy = remainingAfter > suggestedMaxToday * daysRemaining * 0.5;
    reasons.push(
      categoryRemaining > 0
        ? `En "${category.name}" solo te quedaban ${money(categoryRemaining)} este mes.`
        : `Ya agotaste tu límite de "${category.name}" este mes.`
    );
    if (!stillHealthy) {
      return {
        canSpend: false,
        confidence: "media",
        headline: `No te conviene, ya usaste tu límite de ${category.name}`,
        reasons,
        remainingAfter,
        remainingBudgetNow,
        suggestedMaxToday,
      };
    }
    return {
      canSpend: true,
      confidence: "baja",
      headline: `Sí, pero te pasas del límite que pusiste para ${category.name}`,
      reasons,
      remainingAfter,
      remainingBudgetNow,
      suggestedMaxToday,
    };
  }

  if (amount <= suggestedMaxToday) {
    return {
      canSpend: true,
      confidence: "alta",
      headline: "Sí, está dentro de tu ritmo de gasto diario",
      reasons: [...reasons, `Tu límite sugerido para hoy es ${money(suggestedMaxToday)}.`],
      remainingAfter,
      remainingBudgetNow,
      suggestedMaxToday,
    };
  }

  const overPaceRatio = amount / Math.max(suggestedMaxToday, 0.01);
  const confidence = overPaceRatio > 3 ? "baja" : "media";
  return {
    canSpend: true,
    confidence,
    headline: "Sí, pero te adelantas a tu ritmo de gasto diario",
    reasons: [
      ...reasons,
      `Tu límite sugerido para hoy era ${money(suggestedMaxToday)}; con este gasto tendrás menos margen el resto del mes.`,
    ],
    remainingAfter,
    remainingBudgetNow,
    suggestedMaxToday,
  };
}
