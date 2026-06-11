import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, gradients, radius, spacing, typography } from "../theme";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  transparent?: boolean;
}

export function AppHeader({ title, subtitle, transparent }: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }, transparent && styles.transparent]}>
      <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoDot}>
        <Ionicons name="location" size={16} color="#ffffff" />
      </LinearGradient>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: "transparent",
  },
  transparent: {
    backgroundColor: "transparent",
  },
  logoDot: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  titleBlock: {
    flexShrink: 1,
  },
  title: {
    color: colors.text,
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: 1,
  },
});
