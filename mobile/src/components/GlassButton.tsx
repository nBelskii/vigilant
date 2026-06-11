import React from "react";
import { Platform, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
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

// iOS gets the "Liquid Glass" treatment (translucent blur + light highlight
// border), matching the iOS 26 design language. Android falls back to a flat
// tinted surface since BlurView there is less convincing on light themes.
export function GlassButton({ label, icon, onPress, variant = "default", disabled, style }: GlassButtonProps) {
  const isPrimary = variant === "primary";
  const content = (
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
  );

  if (Platform.OS === "ios") {
    return (
      <Pressable onPress={onPress} disabled={disabled} style={[styles.pressable, disabled && styles.disabled, style]}>
        {isPrimary ? (
          <View style={[styles.glassBase, styles.glassPrimary]}>{content}</View>
        ) : (
          <BlurView intensity={50} tint="light" style={[styles.glassBase, styles.glassLight]}>
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
        isPrimary ? styles.glassPrimary : styles.androidLight,
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
    opacity: 0.6,
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
  glassLight: {
    backgroundColor: "rgba(255,255,255,0.35)",
    borderColor: "rgba(255,255,255,0.6)",
  },
  androidLight: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderColor: colors.border,
  },
  glassPrimary: {
    backgroundColor: colors.brandEnd,
    borderColor: "rgba(255,255,255,0.35)",
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
