import React, { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { useApp } from "../state/AppContext";
import { parseAmount } from "../domain/format";
import { Button, Card, Chip, DeleteButton, Field, Screen, SectionTitle } from "../components/ui";
import { CURRENCIES } from "../types";
import { colors, spacing } from "../theme";

export default function AjustesScreen() {
  const { state, setCurrency, addCategory, updateCategoryLimit, removeCategory, updateBudget, setPremium } = useApp();

  const [income, setIncome] = useState(String(state.budget.monthlyIncome || ""));
  const [monthlyBudget, setMonthlyBudget] = useState(String(state.budget.monthlyBudget || ""));
  const [savings, setSavings] = useState(String(state.budget.savingsGoalPercent ?? 10));

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryLimit, setNewCategoryLimit] = useState("");
  const [limitDrafts, setLimitDrafts] = useState<Record<string, string>>({});

  function saveBudget() {
    updateBudget({
      monthlyIncome: parseFloat(income) || 0,
      monthlyBudget: parseFloat(monthlyBudget) || 0,
      savingsGoalPercent: parseFloat(savings) || 0,
    });
  }

  function addNewCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    const dup = state.categories.some((c) => c.name.toLowerCase() === name.toLowerCase());
    if (dup) {
      Alert.alert("Ya existe", "Ya tenés una categoría con ese nombre.");
      return;
    }
    const limit = newCategoryLimit === "" ? null : parseAmount(newCategoryLimit);
    addCategory(name, isNaN(limit as number) ? null : limit);
    setNewCategoryName("");
    setNewCategoryLimit("");
  }

  function commitLimit(id: string) {
    const raw = limitDrafts[id];
    if (raw === undefined) return;
    const value = raw.trim() === "" ? null : parseAmount(raw);
    updateCategoryLimit(id, value === null || isNaN(value) ? null : value);
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionTitle>Moneda</SectionTitle>
        <Card style={{ marginBottom: spacing(2) }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {CURRENCIES.map((c) => (
              <Chip key={c.code} label={c.code} selected={state.currency === c.code} onPress={() => setCurrency(c.code)} />
            ))}
          </View>
        </Card>

        <SectionTitle>Categorías y límites mensuales</SectionTitle>
        <Card style={{ marginBottom: spacing(2) }}>
          {state.categories.length === 0 && <Text style={{ color: colors.textMuted }}>Sin categorías todavía.</Text>}
          {state.categories.map((cat) => (
            <View
              key={cat.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: spacing(1.25),
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 15 }}>
                  <Text style={{ color: cat.color }}>●</Text> {cat.name}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: spacing(0.5) }}>
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginRight: spacing(1) }}>Límite:</Text>
                  <Field
                    label=""
                    keyboardType="decimal-pad"
                    placeholder="Sin límite"
                    value={limitDrafts[cat.id] ?? String(cat.limit ?? "")}
                    onChangeText={(v) => setLimitDrafts((prev) => ({ ...prev, [cat.id]: v }))}
                    onBlur={() => commitLimit(cat.id)}
                    containerStyle={{ flex: 1, marginBottom: 0 }}
                  />
                </View>
              </View>
              <DeleteButton onPress={() => removeCategory(cat.id)} />
            </View>
          ))}
          <View style={{ flexDirection: "row", gap: spacing(1), marginTop: spacing(1) }}>
            <Field
              label="Nueva categoría"
              placeholder="Nombre"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              containerStyle={{ flex: 2 }}
            />
            <Field
              label="Límite"
              keyboardType="decimal-pad"
              placeholder="Opcional"
              value={newCategoryLimit}
              onChangeText={setNewCategoryLimit}
              containerStyle={{ flex: 1 }}
            />
          </View>
          <Button title="Agregar categoría" variant="ghost" onPress={addNewCategory} />
        </Card>

        <SectionTitle>Presupuesto para el Asesor</SectionTitle>
        <Text style={{ color: colors.textMuted, marginBottom: spacing(2) }}>
          El Asesor ("¿puedo gastar esto?") usa esto para calcular tu ritmo de gasto. Definí un
          presupuesto mensual directo, o un ingreso más una meta de ahorro.
        </Text>
        <Card style={{ marginBottom: spacing(2) }}>
          <Field
            label="Presupuesto mensual (opcional si ponés ingreso)"
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
          <Button title="Guardar presupuesto" onPress={saveBudget} />
        </Card>

        <SectionTitle>Plan</SectionTitle>
        <Card style={{ marginBottom: spacing(4) }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700", marginBottom: spacing(1) }}>
            Plan actual: {state.isPremium ? "Premium" : "Gratis"}
          </Text>
          {!state.isPremium ? (
            <>
              <Text style={{ color: colors.textMuted, lineHeight: 20, marginBottom: spacing(1.5) }}>
                BizMint Premium quita los anuncios, desbloquea respaldo en la nube y exportar
                reportes.
              </Text>
              <Button
                title="Obtener Premium"
                onPress={() =>
                  Alert.alert(
                    "BizMint Premium",
                    "Acá se conectaría la compra real (Google Play Billing). Por ahora simula el desbloqueo.",
                    [
                      { text: "Cancelar", style: "cancel" },
                      { text: "Simular compra", onPress: () => setPremium(true) },
                    ]
                  )
                }
              />
            </>
          ) : (
            <Button title="Volver a plan gratis" variant="ghost" onPress={() => setPremium(false)} />
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}
