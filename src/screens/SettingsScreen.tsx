import React from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useApp } from "../state/AppContext";
import { Button, Card, Screen, SectionTitle } from "../components/ui";
import { colors, spacing } from "../theme";

export default function SettingsScreen() {
  const { state, setPremium } = useApp();

  const onUpgrade = () => {
    // TODO: reemplazar por una compra real (RevenueCat / expo-in-app-purchases)
    // antes de publicar en Google Play. Ver README > Monetización.
    Alert.alert(
      "BizMint Premium",
      "Aquí se conectaría la compra real dentro de la app (Google Play Billing). " +
        "Por ahora simula el desbloqueo premium.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Simular compra", onPress: () => setPremium(true) },
      ]
    );
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionTitle>Ajustes</SectionTitle>

        <Card style={{ marginBottom: spacing(2) }}>
          <Text style={styles.planLabel}>
            Plan actual: {state.isPremium ? "Premium" : "Gratis"}
          </Text>
          {!state.isPremium && (
            <>
              <Text style={styles.desc}>
                BizMint Premium quita los anuncios, desbloquea categorías ilimitadas y respaldo en
                la nube.
              </Text>
              <View style={{ height: spacing(1.5) }} />
              <Button title="Obtener Premium" onPress={onUpgrade} />
            </>
          )}
          {state.isPremium && (
            <Button title="Volver a plan gratis" variant="ghost" onPress={() => setPremium(false)} />
          )}
        </Card>

        <Card>
          <Text style={styles.desc}>
            BizMint guarda tus datos solo en este dispositivo. Próximamente: sincronización en la
            nube para Premium.
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  planLabel: { color: colors.text, fontSize: 16, fontWeight: "700", marginBottom: spacing(1) },
  desc: { color: colors.textMuted, lineHeight: 20 },
});
