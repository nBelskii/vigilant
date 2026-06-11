import React, { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { fetchAlerts } from "../api/client";
import { Alert } from "../types";
import { AlertCard } from "../components/AlertCard";
import { AppHeader } from "../components/AppHeader";
import { colors, spacing, typography } from "../theme";

export function AlertsScreen() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchAlerts();
      setAlerts(data);
    } catch (err) {
      console.error("Failed to load alerts:", err);
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <View style={styles.container}>
      <AppHeader title="Alerts" subtitle="Alberta 511 road alerts" />
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AlertCard alert={item} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<View style={{ height: spacing.md }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>No active alerts right now.</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  empty: {
    color: colors.textMuted,
    fontSize: typography.body.fontSize,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
