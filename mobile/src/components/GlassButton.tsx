import React from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "./MonoText";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../theme";

interface GlassButtonProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  variant?: "default" | "primary";
  disabled?: boolean;
  style?: ViewStyle;
}

// Flat, sharp-edged button — solid black on primary, outlined on default.
// No blur/translucency: the Hi-Fi terminal look reads through crisp borders,
// not soft glass.
export function GlassButton({ label, icon, onPress, variant = "default", disabled, style }: GlassButtonProps) {
  const isPrimary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.base, isPrimary ? styles.primary : styles.outline, disabled && styles.disabled, style]}
    >
      <View style={styles.content}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={isPrimary ? "#ffffff" : colors.text}
            style={styles.icon}
          />
        )}
        <Text style={[styles.label, isPrimary && styles.labelPrimary]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.5,
  },
  outline: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  primary: {
    backgroundColor: colors.brandEnd,
    borderColor: colors.brandEnd,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginRight: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: typography.subheading.fontSize,
    fontWeight: "600",
  },
  labelPrimary: {
    color: "#ffffff",
  },
});
