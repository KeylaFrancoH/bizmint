import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useApp } from "../state/AppContext";
import {
  accountBalance,
  categorySpentMes,
  nextReminderDate,
  totalAccountBalances,
  totalGastosMes,
  totalIncludingPending,
  totalIngresosMes,
} from "../domain/finance";
import { formatMoney, parseAmount } from "../domain/format";
import {
  Button,
  Card,
  EmptyText,
  Field,
  FormModal,
  ListRow,
  ProgressBar,
  Segmented,
} from "../components/ui";
import { colors, spacing } from "../theme";
import { Reminder } from "../types";

export default function ResumenScreen() {
  const { state, adjustAccountBalance, addReminder, updateReminder, removeReminder, removeArchiveEntry, saveMonthSnapshot, addSimItem, removeSimItem, clearSim, setSimBase } =
    useApp();
  const now = new Date();
  const currency = state.currency;
  const money = (n: number) => formatMoney(n, currency);

  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [accountInput, setAccountInput] = useState("");

  const [reminderModal, setReminderModal] = useState<Reminder | "new" | null>(null);
  const [reminderName, setReminderName] = useState("");
  const [reminderAmount, setReminderAmount] = useState("");
  const [reminderDueDay, setReminderDueDay] = useState("1");

  const [simKind, setSimKind] = useState<"ingreso" | "gasto">("ingreso");
  const [simName, setSimName] = useState("");
  const [simAmount, setSimAmount] = useState("");

  const cuentas = totalAccountBalances(state.accounts, state.movements);
  const fullTotal = totalIncludingPending(state.accounts, state.movements);
  const simBaseValue = state.simBase ?? cuentas;
  const simTotal = simBaseValue + state.simItems.reduce((s, i) => s + (i.kind === "ingreso" ? i.amount : -i.amount), 0);
  const [simBaseText, setSimBaseText] = useState(simBaseValue.toFixed(2));
  const simBaseFocused = React.useRef(false);
  if (!simBaseFocused.current && simBaseText !== simBaseValue.toFixed(2)) {
    // Keep the field in sync with external changes while the user isn't editing it.
    setSimBaseText(simBaseValue.toFixed(2));
  }

  const upcoming = useMemo(
    () =>
      state.reminders
        .map((r) => ({ r, when: nextReminderDate(r.dueDay, now) }))
        .sort((a, b) => a.when.getTime() - b.when.getTime()),
    [state.reminders]
  );

  function openEditAccount(id: string) {
    const account = state.accounts.find((a) => a.id === id);
    if (!account) return;
    setEditingAccountId(id);
    setAccountInput(accountBalance(account, state.movements).toFixed(2));
  }

  function saveAccount() {
    if (!editingAccountId) return;
    const value = parseAmount(accountInput);
    if (!isNaN(value)) adjustAccountBalance(editingAccountId, value);
    setEditingAccountId(null);
  }

  function openReminderModal(existing?: Reminder) {
    setReminderModal(existing ?? "new");
    setReminderName(existing?.name ?? "");
    setReminderAmount(existing ? String(existing.amount) : "");
    setReminderDueDay(existing ? String(existing.dueDay) : "1");
  }

  function saveReminder() {
    const amount = parseAmount(reminderAmount);
    const dueDay = parseInt(reminderDueDay, 10);
    if (!reminderName.trim() || isNaN(amount) || amount <= 0 || isNaN(dueDay) || dueDay < 1 || dueDay > 31) {
      Alert.alert("Datos incompletos", "Revisa el nombre, monto y día del mes.");
      return;
    }
    const payload = { name: reminderName.trim(), amount, dueDay };
    if (reminderModal && reminderModal !== "new") updateReminder(reminderModal.id, payload);
    else addReminder(payload);
    setReminderModal(null);
  }

  function addSim() {
    const amount = parseAmount(simAmount);
    if (isNaN(amount) || amount <= 0) return;
    addSimItem({ name: simName.trim(), amount, kind: simKind });
    setSimName("");
    setSimAmount("");
  }

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: spacing(2.5) }}>
      <Text style={styles.title}>BizMint</Text>

      <Card style={{ marginTop: spacing(2) }}>
        <Text style={styles.heroLabel}>Te queda</Text>
        <Text style={[styles.heroAmount, { color: cuentas < 0 ? colors.danger : colors.primary }]}>
          {money(cuentas)}
        </Text>
        {Math.abs(fullTotal - cuentas) > 0.005 && (
          <Text style={styles.muted}>Con todo lo pendiente incluido: {money(fullTotal)}</Text>
        )}
        <View style={styles.accountsWrap}>
          {state.accounts.map((a) => (
            <View key={a.id} style={styles.accountRow}>
              <Text style={styles.accountName}>{a.name}</Text>
              <View style={styles.accountRight}>
                <Text style={styles.accountBalance}>{money(accountBalance(a, state.movements))}</Text>
                <Button title="Editar" variant="ghost" onPress={() => openEditAccount(a.id)} />
              </View>
            </View>
          ))}
        </View>
      </Card>

      <View style={styles.statPair}>
        <Card style={{ flex: 1 }}>
          <Text style={styles.statLabel}>Ingresos</Text>
          <Text style={styles.statValue}>{money(totalIngresosMes(state.movements, now))}</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text style={styles.statLabel}>Gastos</Text>
          <Text style={styles.statValue}>{money(totalGastosMes(state.movements, now))}</Text>
        </Card>
      </View>

      <Card>
        <Text style={styles.cardTitle}>Simulador</Text>
        <Text style={styles.muted}>Probá números hipotéticos sin afectar tus movimientos reales.</Text>
        <View style={{ marginTop: spacing(1.5) }}>
          <Field
            label="Saldo inicial supuesto"
            keyboardType="decimal-pad"
            value={simBaseText}
            onFocus={() => {
              simBaseFocused.current = true;
            }}
            onChangeText={setSimBaseText}
            onBlur={() => {
              simBaseFocused.current = false;
              const parsed = parseAmount(simBaseText);
              setSimBase(isNaN(parsed) ? null : parsed);
            }}
          />
          {state.simBase !== null && (
            <Button
              title="Usar real"
              variant="ghost"
              onPress={() => {
                setSimBase(null);
                setSimBaseText(cuentas.toFixed(2));
              }}
            />
          )}
        </View>
        <Text style={styles.heroLabel}>Total simulado</Text>
        <Text style={[styles.heroAmount, { fontSize: 30, color: simTotal < 0 ? colors.danger : colors.primary }]}>
          {money(simTotal)}
        </Text>
        {state.simItems.map((item) => (
          <ListRow
            key={item.id}
            title={item.name || (item.kind === "ingreso" ? "Ingreso" : "Gasto")}
            amount={`${item.kind === "ingreso" ? "+" : "-"}${money(item.amount)}`}
            amountColor={item.kind === "ingreso" ? colors.primary : undefined}
            onDelete={() => removeSimItem(item.id)}
          />
        ))}
        <Segmented
          value={simKind}
          onChange={setSimKind}
          options={[
            { value: "ingreso", label: "+ Suma" },
            { value: "gasto", label: "− Resta" },
          ]}
        />
        <Field label="Nombre (opcional)" placeholder="Ej. Bono" value={simName} onChangeText={setSimName} />
        <Field label="Monto" keyboardType="decimal-pad" value={simAmount} onChangeText={setSimAmount} />
        <Button title="Agregar" variant="ghost" onPress={addSim} />
        {state.simItems.length > 0 && (
          <View style={{ marginTop: spacing(1) }}>
            <Button title="Limpiar simulación" variant="ghost" onPress={clearSim} />
          </View>
        )}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Próximos pagos</Text>
        {upcoming.length === 0 && <EmptyText>Sin recordatorios. Agregá uno para saber cuándo te toca pagar.</EmptyText>}
        {upcoming.map(({ r, when }) => {
          const days = Math.round((when.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 86400000);
          const whenLabel = days === 0 ? "Hoy" : days === 1 ? "Mañana" : `En ${days} días`;
          return (
            <ListRow
              key={r.id}
              title={r.name}
              subtitle={`${whenLabel} · día ${r.dueDay}`}
              amount={money(r.amount)}
              onPress={() => openReminderModal(r)}
              onDelete={() => removeReminder(r.id)}
            />
          );
        })}
        <View style={{ marginTop: spacing(1) }}>
          <Button title="+ Agregar recordatorio" variant="ghost" onPress={() => openReminderModal()} />
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Categorías</Text>
        {state.categories.length === 0 && <EmptyText>Todavía no hay categorías. Agregá una desde Ajustes.</EmptyText>}
        {state.categories.map((cat) => {
          const spent = categorySpentMes(cat.id, state.movements, now);
          const hasLimit = !!cat.limit && cat.limit > 0;
          const pct = hasLimit ? spent / (cat.limit as number) : spent > 0 ? 1 : 0;
          return (
            <View key={cat.id} style={styles.progressRow}>
              <View style={styles.progressHead}>
                <Text style={styles.progressLabel}>
                  <Text style={{ color: cat.color }}>●</Text> {cat.name}
                </Text>
                <Text style={styles.progressValue}>{hasLimit ? `${money(spent)} / ${money(cat.limit as number)}` : money(spent)}</Text>
              </View>
              <ProgressBar progress={pct} color={hasLimit ? undefined : cat.color} />
            </View>
          );
        })}
      </Card>

      {state.archive.length > 0 && (
        <Card>
          <Text style={styles.cardTitle}>Meses anteriores</Text>
          {state.archive
            .slice()
            .reverse()
            .map((a) => (
              <ListRow
                key={a.id}
                title={a.label}
                subtitle={`Ingresos ${money(a.ingresos)} · Gastos ${money(a.gastos)} · Balance ${money(a.restante)}`}
                onDelete={() => removeArchiveEntry(a.id)}
              />
            ))}
        </Card>
      )}

      <Card>
        <Text style={styles.cardTitle}>Guardar resumen del mes</Text>
        <Text style={styles.muted}>
          Guarda una foto de este mes (ingresos, gastos, saldo) para verla en Gráficos. No borra nada.
        </Text>
        <View style={{ marginTop: spacing(1.5) }}>
          <Button title="Guardar resumen" variant="ghost" onPress={saveMonthSnapshot} />
        </View>
      </Card>

      <FormModal
        visible={editingAccountId !== null}
        title="Editar saldo"
        onClose={() => setEditingAccountId(null)}
        onSubmit={saveAccount}
      >
        <Field label="¿Cuánto tenés ahora?" keyboardType="decimal-pad" value={accountInput} onChangeText={setAccountInput} />
      </FormModal>

      <FormModal
        visible={reminderModal !== null}
        title={reminderModal && reminderModal !== "new" ? "Editar recordatorio" : "Nuevo recordatorio"}
        onClose={() => setReminderModal(null)}
        onSubmit={saveReminder}
      >
        <Field label="Nombre" placeholder="Ej. Gimnasio" value={reminderName} onChangeText={setReminderName} />
        <Field label="Monto" keyboardType="decimal-pad" value={reminderAmount} onChangeText={setReminderAmount} />
        <Field label="Día del mes en que vence (1-31)" keyboardType="number-pad" value={reminderDueDay} onChangeText={setReminderDueDay} />
      </FormModal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  title: { color: colors.text, fontSize: 28, fontWeight: "800" },
  heroLabel: { color: colors.textMuted, fontSize: 14, marginTop: spacing(1) },
  heroAmount: { fontSize: 36, fontWeight: "800" },
  muted: { color: colors.textMuted, marginTop: spacing(0.5) },
  accountsWrap: { marginTop: spacing(2), borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing(1.5) },
  accountRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing(0.75) },
  accountName: { color: colors.text, fontSize: 14 },
  accountRight: { flexDirection: "row", alignItems: "center", gap: spacing(1) },
  accountBalance: { color: colors.text, fontWeight: "700" },
  statPair: { flexDirection: "row", gap: spacing(1.5), marginBottom: spacing(2) },
  statLabel: { color: colors.textMuted, fontSize: 12, textTransform: "uppercase" },
  statValue: { color: colors.text, fontSize: 18, fontWeight: "700", marginTop: spacing(0.5) },
  cardTitle: { color: colors.textMuted, fontSize: 13, textTransform: "uppercase", fontWeight: "700", marginBottom: spacing(1) },
  progressRow: { paddingVertical: spacing(1) },
  progressHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing(0.75) },
  progressLabel: { color: colors.text, fontSize: 14 },
  progressValue: { color: colors.textMuted, fontSize: 13 },
});
