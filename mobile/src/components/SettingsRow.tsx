import React from "react";
import { Pressable, StyleSheet, Switch, View } from "react-native";
import { Text } from "./AppText";
import { Ionicons } from "@expo/vector-icons";
import { radius, spacing, typography } from "../theme";
import { THEME } from "../theme/theme";

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
        <Ionicons name={icon} size={18} color={danger ? THEME.colors.danger : THEME.colors.textPrimary} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.label, danger && styles.labelDanger]}>{label}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      {isSwitch && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: THEME.colors.border, true: THEME.colors.primary }}
          thumbColor={THEME.colors.textOnPrimary}
        />
      )}
      {showChevron && <Ionicons name="chevron-forward" size={18} color={THEME.colors.textSecondary} />}
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
    backgroundColor: THEME.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  iconWrapDanger: {
    backgroundColor: "rgba(255,59,48,0.12)",
  },
  textWrap: {
    flex: 1,
  },
  label: {
    color: THEME.colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "600",
  },
  labelDanger: {
    color: THEME.colors.danger,
  },
  description: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },
});
