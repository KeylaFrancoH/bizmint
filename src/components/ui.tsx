import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
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
  containerStyle,
  style,
  ...props
}: TextInputProps & { label: string; containerStyle?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ marginBottom: spacing(2) }, containerStyle]}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

export function ProgressBar({ progress, color }: { progress: number; color?: string }) {
  const clamped = Math.max(0, Math.min(1, progress));
  const fillColor = color ?? (clamped < 0.7 ? colors.primary : clamped < 1 ? colors.warning : colors.danger);
  return (
    <View style={styles.progressTrack}>
      <View
        style={[styles.progressFill, { width: `${clamped * 100}%`, backgroundColor: fillColor }]}
      />
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={[styles.segmentedBtn, value === opt.value && styles.segmentedBtnActive]}
        >
          <Text style={[styles.segmentedText, value === opt.value && styles.segmentedTextActive]}>
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function DeleteButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.deleteBtn}>
      <Text style={styles.deleteBtnText}>✕</Text>
    </Pressable>
  );
}

export function ListRow({
  title,
  subtitle,
  amount,
  amountColor,
  onPress,
  onDelete,
}: {
  title: string;
  subtitle?: string;
  amount?: string;
  amountColor?: string;
  onPress?: () => void;
  onDelete?: () => void;
}) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <View style={styles.listRow}>
      <Wrapper style={{ flex: 1 }} onPress={onPress}>
        <Text style={styles.listRowTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.listRowSubtitle}>{subtitle}</Text>}
      </Wrapper>
      {amount !== undefined && (
        <Text style={[styles.listRowAmount, amountColor ? { color: amountColor } : null]}>
          {amount}
        </Text>
      )}
      {onDelete && <DeleteButton onPress={onDelete} />}
    </View>
  );
}

export function EmptyText({ children }: { children: React.ReactNode }) {
  return <Text style={styles.empty}>{children}</Text>;
}

export function FormModal({
  visible,
  title,
  onClose,
  children,
  onSubmit,
  submitLabel = "Guardar",
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  onSubmit: () => void;
  submitLabel?: string;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>{title}</Text>
            {children}
          </ScrollView>
          <View style={styles.modalActions}>
            <Pressable style={[styles.button, styles.modalActionBtn, { backgroundColor: colors.bgAlt, borderWidth: 1, borderColor: colors.border }]} onPress={onClose}>
              <Text style={[styles.buttonText, { color: colors.text }]}>Cancelar</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.modalActionBtn, { backgroundColor: colors.primary }]} onPress={onSubmit}>
              <Text style={styles.buttonText}>{submitLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
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
  segmented: {
    flexDirection: "row",
    backgroundColor: colors.bgAlt,
    borderRadius: radius.sm,
    padding: 3,
    marginBottom: spacing(2),
  },
  segmentedBtn: {
    flex: 1,
    paddingVertical: spacing(1),
    borderRadius: radius.sm - 2,
    alignItems: "center",
  },
  segmentedBtnActive: {
    backgroundColor: colors.card,
  },
  segmentedText: {
    color: colors.textMuted,
    fontWeight: "600",
    fontSize: 13,
  },
  segmentedTextActive: {
    color: colors.text,
  },
  deleteBtn: {
    paddingHorizontal: spacing(0.75),
    paddingVertical: spacing(0.5),
  },
  deleteBtnText: {
    color: colors.textMuted,
    fontSize: 16,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing(1.25),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing(1),
  },
  listRowTitle: {
    color: colors.text,
    fontSize: 15,
  },
  listRowSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  listRowAmount: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 15,
  },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: spacing(3),
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: spacing(2.5),
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(2.5),
    maxHeight: "85%",
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing(2),
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing(1.5),
    marginTop: spacing(1),
  },
  modalActionBtn: {
    flex: 1,
  },
});
