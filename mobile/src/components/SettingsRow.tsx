import React from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../theme";

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  onPress?: () => void;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  showChevron?: boolean;
  danger?: boolean;
}

export function SettingsRow({
  icon,
  label,
  description,
  onPress,
  value,
  onValueChange,
  showChevron,
  danger,
}: SettingsRowProps) {
  const isSwitch = onValueChange !== undefined;

  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress && !isSwitch}>
      <View style={[styles.iconWrap, danger && styles.iconWrapDanger]}>
        <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.text} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.label, danger && styles.labelDanger]}>{label}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      {isSwitch && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.brandEnd }}
          thumbColor={colors.text}
        />
      )}
      {showChevron && <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  iconWrapDanger: {
    backgroundColor: "rgba(255,71,87,0.12)",
  },
  textWrap: {
    flex: 1,
  },
  label: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    fontWeight: "600",
  },
  labelDanger: {
    color: colors.danger,
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },
});
