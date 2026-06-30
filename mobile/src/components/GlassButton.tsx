import React from "react";
import { Platform, Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "./AppText";
import { BlurView } from "expo-blur";
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

// iOS gets the "Liquid Glass" treatment (translucent dark blur + light
// highlight border), matching the iOS 26 design language on a dark canvas.
// Android falls back to a flat tinted surface since BlurView there is less
// convincing.
export function GlassButton({ label, icon, onPress, variant = "default", disabled, style }: GlassButtonProps) {
  const isPrimary = variant === "primary";
  const content = (
    <View style={styles.content}>
      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={isPrimary ? colors.background : colors.text}
          style={styles.icon}
        />
      )}
      <Text style={[styles.label, isPrimary && styles.labelPrimary]}>{label}</Text>
    </View>
  );

  if (Platform.OS === "ios") {
    return (
      <Pressable onPress={onPress} disabled={disabled} style={[styles.pressable, disabled && styles.disabled, style]}>
        {isPrimary ? (
          <View style={[styles.glassBase, styles.glassPrimary]}>{content}</View>
        ) : (
          <BlurView intensity={50} tint="dark" style={[styles.glassBase, styles.glassDark]}>
            {content}
          </BlurView>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.pressable,
        styles.glassBase,
        isPrimary ? styles.glassPrimary : styles.androidDark,
        disabled && styles.disabled,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: radius.full,
    overflow: "hidden",
  },
  disabled: {
    opacity: 0.5,
  },
  glassBase: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  glassDark: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.14)",
  },
  androidDark: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
  },
  glassPrimary: {
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
    color: colors.background,
  },
});
