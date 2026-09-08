import React, { useMemo, useState } from "react";
import { Alert, SectionList, StyleSheet, Text } from "react-native";
import { useApp } from "../state/AppContext";
import { startOfWeek } from "../domain/finance";
import { formatDate, formatMoney } from "../domain/format";
import { EmptyText, ListRow, Screen, Segmented, SectionTitle } from "../components/ui";
import { colors, spacing } from "../theme";
import { Movement, MovementKind } from "../types";

type Filter = "todos" | MovementKind;

function weekLabel(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  return `Semana del ${fmt(monday)} al ${fmt(sunday)}`;
}

export default function MovimientosScreen({ navigation }: any) {
  const { state, removeMovement } = useApp();
  const [filter, setFilter] = useState<Filter>("todos");
  const currency = state.currency;

  const sections = useMemo(() => {
    const matches = (m: Movement) => filter === "todos" || m.kind === filter;
    const items = state.movements
      .map((m, i) => ({ m, i }))
      .filter((x) => matches(x.m))
      .sort((a, b) => b.m.date.localeCompare(a.m.date) || b.i - a.i)
      .map((x) => x.m);

    const groups: { title: string; weekKey: number; data: Movement[] }[] = [];
    items.forEach((m) => {
      const monday = startOfWeek(new Date(m.date));
      const weekKey = monday.getTime();
      let group = groups.find((g) => g.weekKey === weekKey);
      if (!group) {
        group = { title: weekLabel(monday), weekKey, data: [] };
        groups.push(group);
      }
      group.data.push(m);
    });
    return groups;
  }, [state.movements, filter]);

  function subLabel(m: Movement): string {
    if (m.kind === "transferencia") {
      const from = state.accounts.find((a) => a.id === m.fromAccountId);
      const to = state.accounts.find((a) => a.id === m.toAccountId);
      return `${from?.name ?? "?"} → ${to?.name ?? "?"} · ${formatDate(m.date)}`;
    }
    const cat = state.categories.find((c) => c.id === m.categoryId);
    const account = state.accounts.find((a) => a.id === m.accountId);
    const extra = [account?.name, cat?.name].filter(Boolean).join(" · ");
    return `${extra ? extra + " · " : ""}${formatDate(m.date)}${m.settled === false ? " · Pendiente" : ""}`;
  }

  function onDelete(m: Movement) {
    Alert.alert("Eliminar movimiento", `¿Eliminar "${m.name}" por ${formatMoney(m.amount, currency)}?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => removeMovement(m.id) },
    ]);
  }

  return (
    <Screen>
      <SectionTitle>Movimientos</SectionTitle>
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: "todos", label: "Todos" },
          { value: "ingreso", label: "Ingresos" },
          { value: "gasto", label: "Gastos" },
        ]}
      />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyText>Sin movimientos todavía. Tocá Agregar para sumar uno.</EmptyText>}
        renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
        renderItem={({ item }) => {
          const sign = item.kind === "ingreso" ? "+" : item.kind === "transferencia" ? "" : "−";
          return (
            <ListRow
              title={item.name}
              subtitle={subLabel(item)}
              amount={`${sign}${formatMoney(item.amount, currency)}`}
              amountColor={item.kind === "ingreso" ? colors.primary : undefined}
              onPress={() => navigation.navigate("Agregar", { editId: item.id })}
              onDelete={() => onDelete(item)}
            />
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    fontWeight: "700",
    marginTop: spacing(1.5),
    marginBottom: spacing(0.5),
    backgroundColor: colors.bg,
  },
});
