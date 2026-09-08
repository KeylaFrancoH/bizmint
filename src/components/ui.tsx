import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  StyleProp,
  ViewStyle,
  TextInput,
  TextInputProps,
} from "react-native";
import { colors, radius, spacing } from "../theme";

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Screen({ children }: { children: React.ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" && { backgroundColor: colors.primary },
        variant === "danger" && { backgroundColor: colors.danger },
        variant === "ghost" && {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: colors.border,
        },
        disabled && { opacity: 0.5 },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant === "ghost" && { color: colors.text },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function Field({
  label,
  ...props
}: TextInputProps & { label: string }) {
  return (
    <View style={{ marginBottom: spacing(2) }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

export function ProgressBar({ progress }: { progress: number }) {
  const clamped = Math.max(0, Math.min(1, progress));
  const color =
    clamped < 0.7 ? colors.primary : clamped < 1 ? colors.warning : colors.danger;
  return (
    <View style={styles.progressTrack}>
      <View
        style={[styles.progressFill, { width: `${clamped * 100}%`, backgroundColor: color }]}
      />
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        selected && { backgroundColor: colors.primary, borderColor: colors.primary },
      ]}
    >
      <Text style={[styles.chipText, selected && { color: colors.bg, fontWeight: "700" }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing(2.5),
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing(2.5),
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing(1.5),
  },
  button: {
    paddingVertical: spacing(1.75),
    borderRadius: radius.md,
    alignItems: "center",
  },
  buttonText: {
    color: colors.bg,
    fontWeight: "700",
    fontSize: 16,
  },
  label: {
    color: colors.textMuted,
    marginBottom: spacing(0.75),
    fontSize: 13,
  },
  input: {
    backgroundColor: colors.bgAlt,
    color: colors.text,
    borderRadius: radius.sm,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(1.5),
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
  },
  progressTrack: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.bgAlt,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.pill,
  },
  chip: {
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(1),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing(1),
    marginBottom: spacing(1),
  },
  chipText: {
    color: colors.text,
    fontSize: 13,
  },
});
