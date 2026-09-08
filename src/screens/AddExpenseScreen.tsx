import React, { useState } from "react";
import { ScrollView, Text, View, StyleSheet, Alert } from "react-native";
import { useApp } from "../state/AppContext";
import { Button, Chip, Field, Screen, SectionTitle } from "../components/ui";
import { CATEGORIES, Category } from "../types";
import { colors, spacing } from "../theme";

export default function AddExpenseScreen({ navigation }: any) {
  const { addExpense } = useApp();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Otros");
  const [note, setNote] = useState("");

  const onSave = () => {
    const value = parseFloat(amount.replace(",", "."));
    if (!value || value <= 0) {
      Alert.alert("Monto inválido", "Ingresa un monto mayor a 0.");
      return;
    }
    addExpense({
      amount: value,
      category,
      note: note.trim(),
      date: new Date().toISOString(),
    });
    setAmount("");
    setNote("");
    setCategory("Otros");
    navigation.navigate("Inicio");
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionTitle>Nuevo gasto</SectionTitle>
        <Field
          label="Monto"
          keyboardType="decimal-pad"
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
        />
        <Text style={styles.label}>Categoría</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((c) => (
            <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
          ))}
        </View>
        <Field
          label="Nota (opcional)"
          placeholder="Ej. Almuerzo con equipo"
          value={note}
          onChangeText={setNote}
        />
        <Button title="Guardar gasto" onPress={onSave} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.textMuted, marginBottom: spacing(0.75), fontSize: 13 },
  chips: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing(1) },
});
