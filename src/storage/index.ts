import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, BudgetSettings } from "../types";

const STORAGE_KEY = "bizmint:v2:state";

export const DEFAULT_BUDGET: BudgetSettings = {
  monthlyIncome: 0,
  monthlyBudget: 0,
  savingsGoalPercent: 10,
};

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function freshState(): AppState {
  return {
    accounts: [
      { id: uid(), name: "Efectivo", startBalance: 0 },
      { id: uid(), name: "Tarjeta", startBalance: 0 },
    ],
    categories: [],
    movements: [],
    reminders: [],
    goals: [],
    archive: [],
    currency: "USD",
    simItems: [],
    simBase: null,
    budget: DEFAULT_BUDGET,
    isPremium: false,
  };
}

export async function loadState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    return {
      ...freshState(),
      ...parsed,
      budget: { ...DEFAULT_BUDGET, ...parsed.budget },
    };
  } catch {
    return freshState();
  }
}

export async function saveState(state: AppState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
