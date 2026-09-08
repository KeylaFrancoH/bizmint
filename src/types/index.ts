export type Category =
  | "Comida"
  | "Transporte"
  | "Vivienda"
  | "Ocio"
  | "Salud"
  | "Compras"
  | "Servicios"
  | "Ahorro"
  | "Otros";

export const CATEGORIES: Category[] = [
  "Comida",
  "Transporte",
  "Vivienda",
  "Ocio",
  "Salud",
  "Compras",
  "Servicios",
  "Ahorro",
  "Otros",
];

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  note: string;
  date: string; // ISO date
  createdAt: string; // ISO datetime
}

export interface BudgetSettings {
  monthlyIncome: number;
  monthlyBudget: number;
  savingsGoalPercent: number; // e.g. 10 = keep 10% of income unspent
  categoryBudgets: Partial<Record<Category, number>>;
}

export interface AppState {
  expenses: Expense[];
  budget: BudgetSettings;
  isPremium: boolean;
  onboardingComplete: boolean;
}

export interface SpendAdvice {
  canSpend: boolean;
  confidence: "alta" | "media" | "baja";
  headline: string;
  reasons: string[];
  remainingAfter: number;
  remainingBudgetNow: number;
  suggestedMaxToday: number;
}
