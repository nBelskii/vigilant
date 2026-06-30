import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Text } from "./AppText";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../theme";
import { MAP_SKINS, MapSkin } from "../utils/mapStyles";

interface MapStyleSwitcherProps {
  selected: MapSkin;
  onSelect: (skin: MapSkin) => void;
}

export function MapStyleSwitcher({ selected, onSelect }: MapStyleSwitcherProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable style={styles.button} onPress={() => setOpen(true)}>
        <Ionicons name="layers" size={20} color="#1A1A1A" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.menu}>
            <Text style={styles.menuTitle}>Map style</Text>
            {MAP_SKINS.map((skin) => {
              const active = skin.id === selected.id;
              return (
                <Pressable
                  key={skin.id}
                  style={[styles.option, active && styles.optionActive]}
                  onPress={() => {
                    onSelect(skin);
                    setOpen(false);
                  }}
                >
                  <Ionicons
                    name={skin.icon}
                    size={18}
                    color={active ? colors.brandEnd : colors.textMuted}
                    style={styles.optionIcon}
                  />
                  <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{skin.label}</Text>
                  {active && <Ionicons name="checkmark" size={18} color={colors.brandEnd} />}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  menu: {
    width: 220,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  menuTitle: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  optionActive: {
    backgroundColor: colors.surfaceAlt,
  },
  optionIcon: {
    marginRight: spacing.md,
  },
  optionLabel: {
    flex: 1,
    color: colors.text,
    fontSize: typography.body.fontSize,
  },
  optionLabelActive: {
    fontWeight: "700",
  },
});
