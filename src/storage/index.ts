import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, BudgetSettings } from "../types";

const STORAGE_KEY = "bizmint:v1:state";

export const DEFAULT_BUDGET: BudgetSettings = {
  monthlyIncome: 0,
  monthlyBudget: 0,
  savingsGoalPercent: 10,
  categoryBudgets: {},
};

export const DEFAULT_STATE: AppState = {
  expenses: [],
  budget: DEFAULT_BUDGET,
  isPremium: false,
  onboardingComplete: false,
};

export async function loadState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      budget: { ...DEFAULT_BUDGET, ...parsed.budget },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export async function saveState(state: AppState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
