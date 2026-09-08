import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppState, BudgetSettings, Expense } from "../types";
import { DEFAULT_STATE, loadState, saveState } from "../storage";

interface AppContextValue {
  state: AppState;
  ready: boolean;
  addExpense: (expense: Omit<Expense, "id" | "createdAt">) => void;
  removeExpense: (id: string) => void;
  updateBudget: (budget: Partial<BudgetSettings>) => void;
  setPremium: (value: boolean) => void;
  completeOnboarding: () => void;
}

const AppCtx = createContext<AppContextValue | null>(null);

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadState().then((loaded) => {
      setState(loaded);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) saveState(state);
  }, [state, ready]);

  const addExpense = useCallback((expense: Omit<Expense, "id" | "createdAt">) => {
    setState((prev) => ({
      ...prev,
      expenses: [
        { ...expense, id: uid(), createdAt: new Date().toISOString() },
        ...prev.expenses,
      ],
    }));
  }, []);

  const removeExpense = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  }, []);

  const updateBudget = useCallback((budget: Partial<BudgetSettings>) => {
    setState((prev) => ({ ...prev, budget: { ...prev.budget, ...budget } }));
  }, []);

  const setPremium = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, isPremium: value }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setState((prev) => ({ ...prev, onboardingComplete: true }));
  }, []);

  const value = useMemo(
    () => ({
      state,
      ready,
      addExpense,
      removeExpense,
      updateBudget,
      setPremium,
      completeOnboarding,
    }),
    [state, ready, addExpense, removeExpense, updateBudget, setPremium, completeOnboarding]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
