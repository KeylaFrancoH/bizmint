import React, { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View, Alert } from "react-native";
import { useApp } from "../state/AppContext";
import { Screen, SectionTitle } from "../components/ui";
import { colors, radius, spacing } from "../theme";
import { Expense } from "../types";

export default function ExpensesScreen() {
  const { state, removeExpense } = useApp();

  const sorted = useMemo(
    () =>
      [...state.expenses].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [state.expenses]
  );

  const onDelete = (expense: Expense) => {
    Alert.alert("Eliminar gasto", `¿Eliminar "${expense.category}" por $${expense.amount.toFixed(2)}?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => removeExpense(expense.id) },
    ]);
  };

  return (
    <Screen>
      <SectionTitle>Historial de gastos</SectionTitle>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Aún no hay gastos registrados.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.item} onLongPress={() => onDelete(item)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.category}>{item.category}</Text>
              {!!item.note && <Text style={styles.note}>{item.note}</Text>}
              <Text style={styles.date}>
                {new Date(item.date).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                })}
              </Text>
            </View>
            <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { color: colors.textMuted, marginTop: spacing(2) },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(2),
    marginBottom: spacing(1.25),
  },
  category: { color: colors.text, fontWeight: "700", fontSize: 15 },
  note: { color: colors.textMuted, marginTop: 2 },
  date: { color: colors.textMuted, marginTop: 4, fontSize: 12 },
  amount: { color: colors.text, fontWeight: "800", fontSize: 16 },
});
