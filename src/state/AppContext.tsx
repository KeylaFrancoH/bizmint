import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AppState,
  BudgetSettings,
  Category,
  Goal,
  GoalEntry,
  Movement,
  Reminder,
  SimItem,
} from "../types";
import { freshState, loadState, saveState } from "../storage";
import { accountBalance, todayISO } from "../domain/finance";

interface AppContextValue {
  state: AppState;
  ready: boolean;

  addMovement: (movement: Omit<Movement, "id">) => void;
  updateMovement: (id: string, movement: Omit<Movement, "id">) => void;
  removeMovement: (id: string) => void;

  addCategory: (name: string, limit: number | null) => Category;
  updateCategoryLimit: (id: string, limit: number | null) => void;
  removeCategory: (id: string) => void;

  adjustAccountBalance: (id: string, targetBalance: number) => void;

  addReminder: (reminder: Omit<Reminder, "id">) => void;
  updateReminder: (id: string, reminder: Omit<Reminder, "id">) => void;
  removeReminder: (id: string) => void;

  addGoal: (goal: Omit<Goal, "id" | "entries">) => void;
  removeGoal: (id: string) => void;
  addGoalEntry: (goalId: string, entry: Omit<GoalEntry, "id">) => void;
  updateGoalEntry: (goalId: string, entryId: string, entry: Omit<GoalEntry, "id">) => void;
  removeGoalEntry: (goalId: string, entryId: string) => void;

  saveMonthSnapshot: () => void;
  removeArchiveEntry: (id: string) => void;

  addSimItem: (item: Omit<SimItem, "id">) => void;
  removeSimItem: (id: string) => void;
  clearSim: () => void;
  setSimBase: (value: number | null) => void;

  setCurrency: (currency: string) => void;
  updateBudget: (budget: Partial<BudgetSettings>) => void;
  setPremium: (value: boolean) => void;
}

const AppCtx = createContext<AppContextValue | null>(null);

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(freshState);
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

  const addMovement = useCallback((movement: Omit<Movement, "id">) => {
    setState((prev) => ({ ...prev, movements: [{ ...movement, id: uid() }, ...prev.movements] }));
  }, []);

  const updateMovement = useCallback((id: string, movement: Omit<Movement, "id">) => {
    setState((prev) => ({
      ...prev,
      movements: prev.movements.map((m) => (m.id === id ? { ...movement, id } : m)),
    }));
  }, []);

  const removeMovement = useCallback((id: string) => {
    setState((prev) => ({ ...prev, movements: prev.movements.filter((m) => m.id !== id) }));
  }, []);

  const addCategory = useCallback(
    (name: string, limit: number | null): Category => {
      const palette = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#3f9d3f", "#4a3aa7", "#e34948"];
      const created: Category = {
        id: uid(),
        name,
        limit,
        color: palette[state.categories.length % palette.length],
      };
      setState((prev) => ({ ...prev, categories: [...prev.categories, created] }));
      return created;
    },
    [state.categories.length]
  );

  const updateCategoryLimit = useCallback((id: string, limit: number | null) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === id ? { ...c, limit } : c)),
    }));
  }, []);

  const removeCategory = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
      movements: prev.movements.map((m) => (m.categoryId === id ? { ...m, categoryId: null } : m)),
    }));
  }, []);

  const adjustAccountBalance = useCallback((id: string, targetBalance: number) => {
    setState((prev) => {
      const account = prev.accounts.find((a) => a.id === id);
      if (!account) return prev;
      const current = accountBalance(account, prev.movements);
      const delta = targetBalance - current;
      return {
        ...prev,
        accounts: prev.accounts.map((a) =>
          a.id === id ? { ...a, startBalance: (a.startBalance || 0) + delta } : a
        ),
      };
    });
  }, []);

  const addReminder = useCallback((reminder: Omit<Reminder, "id">) => {
    setState((prev) => ({ ...prev, reminders: [...prev.reminders, { ...reminder, id: uid() }] }));
  }, []);

  const updateReminder = useCallback((id: string, reminder: Omit<Reminder, "id">) => {
    setState((prev) => ({
      ...prev,
      reminders: prev.reminders.map((r) => (r.id === id ? { ...reminder, id } : r)),
    }));
  }, []);

  const removeReminder = useCallback((id: string) => {
    setState((prev) => ({ ...prev, reminders: prev.reminders.filter((r) => r.id !== id) }));
  }, []);

  const addGoal = useCallback((goal: Omit<Goal, "id" | "entries">) => {
    setState((prev) => ({ ...prev, goals: [...prev.goals, { ...goal, id: uid(), entries: [] }] }));
  }, []);

  const removeGoal = useCallback((id: string) => {
    setState((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== id) }));
  }, []);

  const addGoalEntry = useCallback((goalId: string, entry: Omit<GoalEntry, "id">) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId ? { ...g, entries: [...g.entries, { ...entry, id: uid() }] } : g
      ),
    }));
  }, []);

  const updateGoalEntry = useCallback(
    (goalId: string, entryId: string, entry: Omit<GoalEntry, "id">) => {
      setState((prev) => ({
        ...prev,
        goals: prev.goals.map((g) =>
          g.id === goalId
            ? { ...g, entries: g.entries.map((e) => (e.id === entryId ? { ...entry, id: entryId } : e)) }
            : g
        ),
      }));
    },
    []
  );

  const removeGoalEntry = useCallback((goalId: string, entryId: string) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId ? { ...g, entries: g.entries.filter((e) => e.id !== entryId) } : g
      ),
    }));
  }, []);

  const saveMonthSnapshot = useCallback(() => {
    setState((prev) => {
      const now = new Date();
      const label = now.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
      const thisMonth = prev.movements.filter((m) => {
        const d = new Date(m.date);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      });
      const ingresos = thisMonth.filter((m) => m.kind === "ingreso").reduce((s, m) => s + m.amount, 0);
      const gastos = thisMonth.filter((m) => m.kind === "gasto").reduce((s, m) => s + m.amount, 0);
      const restante = prev.accounts.reduce((s, a) => s + accountBalance(a, prev.movements), 0);
      const categorias = prev.categories
        .map((c) => ({
          name: c.name,
          color: c.color,
          spent: thisMonth
            .filter((m) => m.kind === "gasto" && m.categoryId === c.id)
            .reduce((s, m) => s + m.amount, 0),
        }))
        .filter((c) => c.spent > 0);
      return {
        ...prev,
        archive: [
          ...prev.archive,
          {
            id: uid(),
            label: label.charAt(0).toUpperCase() + label.slice(1),
            closedAt: todayISO(),
            ingresos,
            gastos,
            restante,
            categorias,
          },
        ],
      };
    });
  }, []);

  const removeArchiveEntry = useCallback((id: string) => {
    setState((prev) => ({ ...prev, archive: prev.archive.filter((a) => a.id !== id) }));
  }, []);

  const addSimItem = useCallback((item: Omit<SimItem, "id">) => {
    setState((prev) => ({ ...prev, simItems: [...prev.simItems, { ...item, id: uid() }] }));
  }, []);

  const removeSimItem = useCallback((id: string) => {
    setState((prev) => ({ ...prev, simItems: prev.simItems.filter((i) => i.id !== id) }));
  }, []);

  const clearSim = useCallback(() => {
    setState((prev) => ({ ...prev, simItems: [] }));
  }, []);

  const setSimBase = useCallback((value: number | null) => {
    setState((prev) => ({ ...prev, simBase: value }));
  }, []);

  const setCurrency = useCallback((currency: string) => {
    setState((prev) => ({ ...prev, currency }));
  }, []);

  const updateBudget = useCallback((budget: Partial<BudgetSettings>) => {
    setState((prev) => ({ ...prev, budget: { ...prev.budget, ...budget } }));
  }, []);

  const setPremium = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, isPremium: value }));
  }, []);

  const value = useMemo(
    () => ({
      state,
      ready,
      addMovement,
      updateMovement,
      removeMovement,
      addCategory,
      updateCategoryLimit,
      removeCategory,
      adjustAccountBalance,
      addReminder,
      updateReminder,
      removeReminder,
      addGoal,
      removeGoal,
      addGoalEntry,
      updateGoalEntry,
      removeGoalEntry,
      saveMonthSnapshot,
      removeArchiveEntry,
      addSimItem,
      removeSimItem,
      clearSim,
      setSimBase,
      setCurrency,
      updateBudget,
      setPremium,
    }),
    [
      state,
      ready,
      addMovement,
      updateMovement,
      removeMovement,
      addCategory,
      updateCategoryLimit,
      removeCategory,
      adjustAccountBalance,
      addReminder,
      updateReminder,
      removeReminder,
      addGoal,
      removeGoal,
      addGoalEntry,
      updateGoalEntry,
      removeGoalEntry,
      saveMonthSnapshot,
      removeArchiveEntry,
      addSimItem,
      removeSimItem,
      clearSim,
      setSimBase,
      setCurrency,
      updateBudget,
      setPremium,
    ]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
