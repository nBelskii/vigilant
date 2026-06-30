import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "./MonoText";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { radius, spacing, typography } from "../theme";
import { THEME } from "../theme/theme";

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
        <Ionicons name="location" size={16} color={THEME.colors.textOnPrimary} />
      </View>
      <View style={[styles.titleBlock, transparent && styles.titleBlockFloating]}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
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
    backgroundColor: THEME.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  titleBlock: {
    flexShrink: 1,
    justifyContent: "center",
    minHeight: 32,
  },
  titleBlockFloating: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    marginTop: 1,
  },
});
