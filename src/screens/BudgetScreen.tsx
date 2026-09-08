import React, { useState } from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";
import { useApp } from "../state/AppContext";
import { Button, Field, Screen, SectionTitle } from "../components/ui";
import { CATEGORIES } from "../types";
import { colors, spacing } from "../theme";

export default function BudgetScreen() {
  const { state, updateBudget } = useApp();
  const [income, setIncome] = useState(String(state.budget.monthlyIncome || ""));
  const [monthlyBudget, setMonthlyBudget] = useState(String(state.budget.monthlyBudget || ""));
  const [savings, setSavings] = useState(String(state.budget.savingsGoalPercent ?? 10));
  const [categoryValues, setCategoryValues] = useState<Record<string, string>>(
    Object.fromEntries(CATEGORIES.map((c) => [c, String(state.budget.categoryBudgets[c] ?? "")]))
  );

  const save = () => {
    const categoryBudgets: Record<string, number> = {};
    for (const c of CATEGORIES) {
      const v = parseFloat(categoryValues[c]);
      if (v > 0) categoryBudgets[c] = v;
    }
    updateBudget({
      monthlyIncome: parseFloat(income) || 0,
      monthlyBudget: parseFloat(monthlyBudget) || 0,
      savingsGoalPercent: parseFloat(savings) || 0,
      categoryBudgets,
    });
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionTitle>Presupuesto mensual</SectionTitle>
        <Text style={styles.hint}>
          Define un presupuesto mensual directo, o un ingreso más una meta de ahorro para que
          BizMint lo calcule por ti.
        </Text>
        <Field
          label="Presupuesto mensual (opcional si pones ingreso)"
          keyboardType="decimal-pad"
          placeholder="0.00"
          value={monthlyBudget}
          onChangeText={setMonthlyBudget}
        />
        <Field
          label="Ingreso mensual"
          keyboardType="decimal-pad"
          placeholder="0.00"
          value={income}
          onChangeText={setIncome}
        />
        <Field
          label="Meta de ahorro (%)"
          keyboardType="decimal-pad"
          placeholder="10"
          value={savings}
          onChangeText={setSavings}
        />

        <SectionTitle>Límites por categoría (opcional)</SectionTitle>
        {CATEGORIES.map((c) => (
          <Field
            key={c}
            label={c}
            keyboardType="decimal-pad"
            placeholder="Sin límite"
            value={categoryValues[c]}
            onChangeText={(v) => setCategoryValues((prev) => ({ ...prev, [c]: v }))}
          />
        ))}

        <Button title="Guardar presupuesto" onPress={save} />
        <View style={{ height: spacing(4) }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { color: colors.textMuted, marginBottom: spacing(2) },
});
