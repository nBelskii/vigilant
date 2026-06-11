import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "../theme";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  transparent?: boolean;
}

export function AppHeader({ title, subtitle, transparent }: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }, transparent && styles.transparent]}>
      <View style={styles.logoDot}>
        <Ionicons name="location" size={16} color="#ffffff" />
      </View>
      <View style={[styles.titleBlock, transparent && styles.titleBlockFloating]}>
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
    backgroundColor: colors.brandEnd,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  titleBlock: {
    flexShrink: 1,
  },
  titleBlockFloating: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
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
