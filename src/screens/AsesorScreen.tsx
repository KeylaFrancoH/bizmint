import React, { useState } from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";
import { useApp } from "../state/AppContext";
import { evaluateSpend } from "../ai/advisor";
import { Button, Card, Chip, Field, Screen, SectionTitle } from "../components/ui";
import { SpendAdvice } from "../types";
import { colors, spacing } from "../theme";

export default function AsesorScreen() {
  const { state } = useApp();
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [advice, setAdvice] = useState<SpendAdvice | null>(null);

  const ask = () => {
    const value = parseFloat(amount.replace(",", "."));
    if (!value || value <= 0) {
      setAdvice(null);
      return;
    }
    setAdvice(evaluateSpend(value, categoryId, state));
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionTitle>¿Puedo gastar esto?</SectionTitle>
        <Text style={styles.hint}>
          Pregúntale a tu asesor de BizMint antes de comprar. Analiza tu presupuesto, lo que ya
          gastaste y cuántos días quedan del mes.
        </Text>
        <Field
          label="¿Cuánto quieres gastar?"
          keyboardType="decimal-pad"
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
        />
        {state.categories.length > 0 && (
          <>
            <Text style={styles.label}>¿En qué categoría? (opcional)</Text>
            <View style={styles.chips}>
              <Chip label="Ninguna" selected={categoryId === null} onPress={() => setCategoryId(null)} />
              {state.categories.map((c) => (
                <Chip key={c.id} label={c.name} selected={categoryId === c.id} onPress={() => setCategoryId(c.id)} />
              ))}
            </View>
          </>
        )}
        <Button title="Preguntarle a BizMint" onPress={ask} />

        {advice && (
          <Card
            style={[
              styles.result,
              { borderColor: advice.canSpend ? colors.primary : colors.danger },
            ]}
          >
            <Text style={[styles.verdict, { color: advice.canSpend ? colors.primary : colors.danger }]}>
              {advice.canSpend ? "SÍ" : "NO"}
            </Text>
            <Text style={styles.headline}>{advice.headline}</Text>
            <Text style={styles.confidence}>Confianza: {advice.confidence}</Text>
            {advice.reasons.map((r, i) => (
              <Text key={i} style={styles.reason}>
                • {r}
              </Text>
            ))}
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { color: colors.textMuted, marginBottom: spacing(2) },
  label: { color: colors.textMuted, marginBottom: spacing(0.75), fontSize: 13 },
  chips: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing(1) },
  result: { marginTop: spacing(3) },
  verdict: { fontSize: 40, fontWeight: "900" },
  headline: { color: colors.text, fontSize: 17, fontWeight: "700", marginTop: spacing(0.5) },
  confidence: { color: colors.textMuted, marginTop: spacing(0.5), marginBottom: spacing(1.5) },
  reason: { color: colors.textMuted, marginBottom: spacing(0.5) },
});
