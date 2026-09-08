import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Switch, Text, View } from "react-native";
import { useApp } from "../state/AppContext";
import { todayISO } from "../domain/finance";
import { parseAmount } from "../domain/format";
import { Button, Chip, Field, FormModal, Screen, Segmented, SectionTitle } from "../components/ui";
import { MovementKind } from "../types";
import { colors, spacing } from "../theme";

export default function AgregarScreen({ navigation, route }: any) {
  const { state, addMovement, updateMovement, addCategory } = useApp();
  const editId: string | undefined = route?.params?.editId;
  const editing = editId ? state.movements.find((m) => m.id === editId) : undefined;

  const [kind, setKind] = useState<MovementKind>("gasto");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [settled, setSettled] = useState(true);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(state.accounts[0]?.id ?? null);
  const [fromAccountId, setFromAccountId] = useState<string | null>(state.accounts[0]?.id ?? null);
  const [toAccountId, setToAccountId] = useState<string | null>(state.accounts[1]?.id ?? state.accounts[0]?.id ?? null);
  const [newCategoryModal, setNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    if (editing) {
      setKind(editing.kind);
      setName(editing.name);
      setAmount(String(editing.amount));
      setDate(editing.date);
      setSettled(editing.settled !== false);
      setCategoryId(editing.categoryId ?? null);
      setAccountId(editing.accountId ?? state.accounts[0]?.id ?? null);
      setFromAccountId(editing.fromAccountId ?? state.accounts[0]?.id ?? null);
      setToAccountId(editing.toAccountId ?? state.accounts[1]?.id ?? null);
    } else {
      resetForm();
    }
  }, [editId]);

  function resetForm() {
    setKind("gasto");
    setName("");
    setAmount("");
    setDate(todayISO());
    setSettled(true);
    setCategoryId(null);
  }

  function onSave() {
    const value = parseAmount(amount);
    if (!name.trim() || isNaN(value) || value <= 0 || !date) {
      Alert.alert("Datos incompletos", "Revisa el nombre, monto y fecha.");
      return;
    }
    if (kind === "transferencia" && (!fromAccountId || !toAccountId || fromAccountId === toAccountId)) {
      Alert.alert("Cuentas inválidas", "Elegí dos cuentas distintas para la transferencia.");
      return;
    }
    const base = { name: name.trim(), amount: value, kind, date, settled };
    const payload =
      kind === "transferencia"
        ? { ...base, fromAccountId, toAccountId, categoryId: null, accountId: null }
        : { ...base, categoryId, accountId, fromAccountId: null, toAccountId: null };

    if (editId) updateMovement(editId, payload);
    else addMovement(payload);

    resetForm();
    navigation.navigate("Movimientos");
  }

  function saveNewCategory() {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    const existing = state.categories.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    const category = existing ?? addCategory(trimmed, null);
    setCategoryId(category.id);
    setNewCategoryName("");
    setNewCategoryModal(false);
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionTitle>{editId ? "Editar movimiento" : "Nuevo movimiento"}</SectionTitle>

        <Segmented
          value={kind}
          onChange={setKind}
          options={[
            { value: "gasto", label: "Gasto" },
            { value: "ingreso", label: "Ingreso" },
            { value: "transferencia", label: "Transferencia" },
          ]}
        />

        <Field label="Nombre" placeholder="Ej. Supermercado" value={name} onChangeText={setName} />
        <Field label="Monto" keyboardType="decimal-pad" placeholder="0.00" value={amount} onChangeText={setAmount} />
        <Field label="Fecha (AAAA-MM-DD)" placeholder={todayISO()} value={date} onChangeText={setDate} />

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing(2) }}>
          <View style={{ flex: 1, marginRight: spacing(1.5) }}>
            <Text style={{ color: colors.text, fontSize: 14 }}>Ya pasó</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
              Apagalo si todavía no lo pagás/cobrás.
            </Text>
          </View>
          <Switch value={settled} onValueChange={setSettled} trackColor={{ true: colors.primary }} />
        </View>

        {kind === "transferencia" ? (
          <>
            <Text style={{ color: colors.textMuted, marginBottom: spacing(0.75), fontSize: 13 }}>Desde</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: spacing(1) }}>
              {state.accounts.map((a) => (
                <Chip key={a.id} label={a.name} selected={fromAccountId === a.id} onPress={() => setFromAccountId(a.id)} />
              ))}
            </View>
            <Text style={{ color: colors.textMuted, marginBottom: spacing(0.75), fontSize: 13 }}>Hacia</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: spacing(1) }}>
              {state.accounts.map((a) => (
                <Chip key={a.id} label={a.name} selected={toAccountId === a.id} onPress={() => setToAccountId(a.id)} />
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={{ color: colors.textMuted, marginBottom: spacing(0.75), fontSize: 13 }}>Cuenta</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: spacing(1) }}>
              {state.accounts.map((a) => (
                <Chip key={a.id} label={a.name} selected={accountId === a.id} onPress={() => setAccountId(a.id)} />
              ))}
            </View>
            <Text style={{ color: colors.textMuted, marginBottom: spacing(0.75), fontSize: 13 }}>Categoría (opcional)</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: spacing(1) }}>
              <Chip label="Ninguna" selected={categoryId === null} onPress={() => setCategoryId(null)} />
              {state.categories.map((c) => (
                <Chip key={c.id} label={c.name} selected={categoryId === c.id} onPress={() => setCategoryId(c.id)} />
              ))}
              <Chip label="+ Nueva" selected={false} onPress={() => setNewCategoryModal(true)} />
            </View>
          </>
        )}

        <Button title={editId ? "Guardar cambios" : "Guardar movimiento"} onPress={onSave} />
      </ScrollView>

      <FormModal
        visible={newCategoryModal}
        title="Nueva categoría"
        onClose={() => setNewCategoryModal(false)}
        onSubmit={saveNewCategory}
      >
        <Field label="Nombre" placeholder="Ej. Comida" value={newCategoryName} onChangeText={setNewCategoryName} />
      </FormModal>
    </Screen>
  );
}
