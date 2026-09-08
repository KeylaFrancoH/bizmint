import React, { useMemo } from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";
import { useApp } from "../state/AppContext";
import { effectiveMonthlyBudget } from "../ai/advisor";
import { Card, ProgressBar, SectionTitle } from "../components/ui";
import { colors, spacing } from "../theme";
import { CATEGORIES } from "../types";

function isThisMonth(iso: string, ref: Date) {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

export default function DashboardScreen() {
  const { state } = useApp();
  const now = new Date();

  const { spent, budget, byCategory } = useMemo(() => {
    const monthExpenses = state.expenses.filter((e) => isThisMonth(e.date, now));
    const spent = monthExpenses.reduce((a, e) => a + e.amount, 0);
    const budget = effectiveMonthlyBudget(state);
    const byCategory: Record<string, number> = {};
    for (const cat of CATEGORIES) byCategory[cat] = 0;
    for (const e of monthExpenses) byCategory[e.category] += e.amount;
    return { spent, budget, byCategory };
  }, [state]);

  const remaining = budget - spent;
  const progress = budget > 0 ? spent / budget : 0;
  const monthName = now.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: spacing(2.5) }}>
      <Text style={styles.title}>BizMint</Text>
      <Text style={styles.subtitle}>Resumen de {monthName}</Text>

      <Card style={{ marginTop: spacing(2) }}>
        <Text style={styles.big}>${spent.toFixed(2)}</Text>
        <Text style={styles.muted}>
          gastado de {budget > 0 ? `$${budget.toFixed(2)}` : "presupuesto sin definir"}
        </Text>
        {budget > 0 && (
          <View style={{ marginTop: spacing(1.5) }}>
            <ProgressBar progress={progress} />
            <Text
              style={[
                styles.muted,
                { marginTop: spacing(1), color: remaining < 0 ? colors.danger : colors.textMuted },
              ]}
            >
              {remaining >= 0
                ? `Te quedan $${remaining.toFixed(2)} este mes`
                : `Superaste tu presupuesto por $${Math.abs(remaining).toFixed(2)}`}
            </Text>
          </View>
        )}
      </Card>

      <SectionTitle>Por categoría</SectionTitle>
      <Card>
        {CATEGORIES.filter((c) => byCategory[c] > 0).length === 0 && (
          <Text style={styles.muted}>Todavía no registras gastos este mes.</Text>
        )}
        {CATEGORIES.filter((c) => byCategory[c] > 0)
          .sort((a, b) => byCategory[b] - byCategory[a])
          .map((cat) => (
            <View key={cat} style={styles.row}>
              <Text style={styles.rowLabel}>{cat}</Text>
              <Text style={styles.rowValue}>${byCategory[cat].toFixed(2)}</Text>
            </View>
          ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  title: { color: colors.text, fontSize: 28, fontWeight: "800" },
  subtitle: { color: colors.textMuted, marginTop: spacing(0.5), textTransform: "capitalize" },
  big: { color: colors.text, fontSize: 36, fontWeight: "800" },
  muted: { color: colors.textMuted },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing(1),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { color: colors.text },
  rowValue: { color: colors.text, fontWeight: "700" },
});
