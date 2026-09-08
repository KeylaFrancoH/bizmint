export type MovementKind = "gasto" | "ingreso" | "transferencia";
export type GoalKind = "deuda" | "ahorro";

export interface Account {
  id: string;
  name: string;
  startBalance: number;
}

export interface Category {
  id: string;
  name: string;
  limit: number | null;
  color: string;
}

export interface Movement {
  id: string;
  name: string;
  amount: number;
  kind: MovementKind;
  date: string; // YYYY-MM-DD
  settled: boolean;
  categoryId?: string | null;
  accountId?: string | null;
  fromAccountId?: string | null;
  toAccountId?: string | null;
}

export interface Reminder {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // 1-31
}

export interface GoalEntry {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
}

export interface Goal {
  id: string;
  name: string;
  kind: GoalKind;
  target: number;
  entries: GoalEntry[];
}

export interface ArchiveEntry {
  id: string;
  label: string;
  closedAt: string;
  ingresos: number;
  gastos: number;
  restante: number;
  categorias: { name: string; color: string; spent: number }[];
}

export interface SimItem {
  id: string;
  name: string;
  amount: number;
  kind: "ingreso" | "gasto";
}

export interface BudgetSettings {
  monthlyIncome: number;
  monthlyBudget: number;
  savingsGoalPercent: number; // e.g. 10 = keep 10% of income unspent
}

export interface AppState {
  accounts: Account[];
  categories: Category[];
  movements: Movement[];
  reminders: Reminder[];
  goals: Goal[];
  archive: ArchiveEntry[];
  currency: string;
  simItems: SimItem[];
  simBase: number | null;
  budget: BudgetSettings;
  isPremium: boolean;
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

export const CATEGORY_PALETTE = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
  "#3f9d3f",
  "#4a3aa7",
  "#e34948",
];

export const OTHER_COLOR = "#9AA0A6";

export const CURRENCIES: { code: string; label: string }[] = [
  { code: "USD", label: "USD — Dólar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "MXN", label: "MXN — Peso mexicano" },
  { code: "COP", label: "COP — Peso colombiano" },
  { code: "PEN", label: "PEN — Sol peruano" },
  { code: "CLP", label: "CLP — Peso chileno" },
  { code: "ARS", label: "ARS — Peso argentino" },
  { code: "BRL", label: "BRL — Real brasileño" },
  { code: "BOB", label: "BOB — Boliviano" },
  { code: "UYU", label: "UYU — Peso uruguayo" },
  { code: "GTQ", label: "GTQ — Quetzal" },
  { code: "CRC", label: "CRC — Colón" },
  { code: "DOP", label: "DOP — Peso dominicano" },
  { code: "GBP", label: "GBP — Libra esterlina" },
  { code: "CAD", label: "CAD — Dólar canadiense" },
];

export const CURRENCY_LOCALE: Record<string, string> = {
  USD: "es-EC",
  EUR: "es-ES",
  MXN: "es-MX",
  COP: "es-CO",
  PEN: "es-PE",
  CLP: "es-CL",
  ARS: "es-AR",
  BRL: "pt-BR",
  BOB: "es-BO",
  UYU: "es-UY",
  GTQ: "es-GT",
  CRC: "es-CR",
  DOP: "es-DO",
  GBP: "en-GB",
  CAD: "en-CA",
};
