import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useApp } from "../state/AppContext";
import { goalPaid, goalPercent, goalRemaining, todayISO } from "../domain/finance";
import { formatDate, formatMoney, parseAmount } from "../domain/format";
import {
  Button,
  Card,
  DeleteButton,
  EmptyText,
  Field,
  FormModal,
  ListRow,
  ProgressBar,
  Screen,
  Segmented,
  SectionTitle,
} from "../components/ui";
import { colors, spacing } from "../theme";
import { Goal, GoalEntry, GoalKind } from "../types";

export default function MetasScreen() {
  const { state, addGoal, removeGoal, addGoalEntry, updateGoalEntry, removeGoalEntry } = useApp();
  const currency = state.currency;
  const money = (n: number) => formatMoney(n, currency);

  const [goalModal, setGoalModal] = useState(false);
  const [goalKind, setGoalKind] = useState<GoalKind>("deuda");
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");

  const [entryModal, setEntryModal] = useState<{ goal: Goal; entry: GoalEntry | null } | null>(null);
  const [entryAmount, setEntryAmount] = useState("");
  const [entryDate, setEntryDate] = useState(todayISO());

  function saveGoal() {
    const target = parseAmount(goalTarget);
    if (!goalName.trim() || isNaN(target) || target <= 0) return;
    addGoal({ name: goalName.trim(), kind: goalKind, target });
    setGoalName("");
    setGoalTarget("");
    setGoalKind("deuda");
    setGoalModal(false);
  }

  function openEntry(goal: Goal, entry: GoalEntry | null) {
    setEntryModal({ goal, entry });
    setEntryAmount(entry ? String(entry.amount) : "");
    setEntryDate(entry ? entry.date : todayISO());
  }

  function saveEntry() {
    if (!entryModal) return;
    const amount = parseAmount(entryAmount);
    if (isNaN(amount) || amount <= 0 || !entryDate) return;
    if (entryModal.entry) updateGoalEntry(entryModal.goal.id, entryModal.entry.id, { amount, date: entryDate });
    else addGoalEntry(entryModal.goal.id, { amount, date: entryDate });
    setEntryModal(null);
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionTitle>Metas</SectionTitle>
        {state.goals.length === 0 && (
          <EmptyText>Sin metas todavía. Agregá una deuda para pagar o una meta de ahorro.</EmptyText>
        )}
        {state.goals.map((g) => {
          const paid = goalPaid(g);
          const remaining = goalRemaining(g);
          const pct = goalPercent(g);
          const paidLabel = g.kind === "ahorro" ? "Ahorrado" : "Pagado";
          const actionLabel = g.kind === "ahorro" ? "+ Registrar ahorro" : "+ Registrar pago";
          const entries = [...g.entries].sort((a, b) => b.date.localeCompare(a.date));
          return (
            <Card key={g.id} style={{ marginBottom: spacing(2) }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>{g.name}</Text>
                  <Text
                    style={{
                      color: g.kind === "ahorro" ? colors.primary : colors.danger,
                      fontSize: 11,
                      textTransform: "uppercase",
                      fontWeight: "700",
                      marginTop: 4,
                    }}
                  >
                    {g.kind === "ahorro" ? "Ahorro" : "Deuda"}
                  </Text>
                </View>
                <DeleteButton onPress={() => removeGoal(g.id)} />
              </View>
              <View style={{ marginVertical: spacing(1.5) }}>
                <ProgressBar progress={pct / 100} color={g.kind === "ahorro" ? colors.primary : colors.danger} />
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                  {paidLabel} {money(paid)}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Falta {money(remaining)}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{Math.round(pct)}%</Text>
              </View>
              <View style={{ marginTop: spacing(1.5), alignItems: "flex-end" }}>
                <Button title={actionLabel} variant="ghost" onPress={() => openEntry(g, null)} />
              </View>
              {entries.map((en) => (
                <ListRow
                  key={en.id}
                  title={money(en.amount)}
                  subtitle={formatDate(en.date)}
                  onPress={() => openEntry(g, en)}
                  onDelete={() => removeGoalEntry(g.id, en.id)}
                />
              ))}
            </Card>
          );
        })}
        <Button title="+ Nueva meta" onPress={() => setGoalModal(true)} />
      </ScrollView>

      <FormModal visible={goalModal} title="Nueva meta" onClose={() => setGoalModal(false)} onSubmit={saveGoal}>
        <Segmented
          value={goalKind}
          onChange={setGoalKind}
          options={[
            { value: "deuda", label: "Deuda" },
            { value: "ahorro", label: "Ahorro" },
          ]}
        />
        <Field label="Nombre" placeholder="Ej. Tarjeta de crédito" value={goalName} onChangeText={setGoalName} />
        <Field
          label={goalKind === "ahorro" ? "Meta de ahorro" : "Monto total a pagar"}
          keyboardType="decimal-pad"
          value={goalTarget}
          onChangeText={setGoalTarget}
        />
      </FormModal>

      <FormModal
        visible={entryModal !== null}
        title={entryModal?.entry ? "Editar registro" : entryModal?.goal.kind === "ahorro" ? "Registrar ahorro" : "Registrar pago"}
        onClose={() => setEntryModal(null)}
        onSubmit={saveEntry}
      >
        <Field label="Monto" keyboardType="decimal-pad" value={entryAmount} onChangeText={setEntryAmount} />
        <Field label="Fecha (AAAA-MM-DD)" value={entryDate} onChangeText={setEntryDate} />
      </FormModal>
    </Screen>
  );
}
