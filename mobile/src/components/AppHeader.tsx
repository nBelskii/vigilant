import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, gradients, radius, spacing, typography } from "../theme";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  transparent?: boolean;
}

export function AppHeader({ title, subtitle, transparent }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing.sm },
        transparent ? styles.transparent : styles.solid,
      ]}
    >
      <View style={styles.titleBlock}>
        <View style={styles.titleRow}>
          <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoDot}>
            <Ionicons name="location" size={14} color={colors.text} />
          </LinearGradient>
          <Text style={styles.title}>{title}</Text>
        </View>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <Pressable
        style={styles.profileButton}
        onPress={() => navigation.navigate("Profile")}
        hitSlop={8}
      >
        <Ionicons name="person-circle-outline" size={28} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  solid: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transparent: {
    backgroundColor: "rgba(10,10,15,0.55)",
  },
  titleBlock: {
    flexShrink: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoDot: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: 2,
    marginLeft: 34,
  },
  profileButton: {
    padding: spacing.xs,
  },
});
