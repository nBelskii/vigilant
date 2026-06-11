import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../theme";
import { GeocodeResult, geocodeAddress } from "../utils/geo";

interface AddressSearchProps {
  onSelect: (result: GeocodeResult) => void;
}

export function AddressSearch({ onSelect }: AddressSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = async (text: string) => {
    if (!text.trim()) {
      setResults([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await geocodeAddress(text);
      setResults(data);
      if (data.length === 0) {
        setError("No matches found.");
      }
    } catch (err) {
      console.error("Geocode error:", err);
      setError("Couldn't search that address. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(text), 400);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <View>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search an address or neighbourhood"
          placeholderTextColor={colors.textFaint}
          value={query}
          onChangeText={handleChangeText}
          onSubmitEditing={() => search(query)}
          returnKeyType="search"
          autoCorrect={false}
        />
        {loading && <ActivityIndicator size="small" color={colors.brandEnd} />}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {results.length > 0 && (
        <View style={styles.results}>
          <FlatList
            data={results}
            keyExtractor={(item, index) => `${item.lat}-${item.lng}-${index}`}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Pressable
                style={styles.resultRow}
                onPress={() => {
                  onSelect(item);
                  setResults([]);
                  setError(null);
                  setQuery(item.label);
                }}
              >
                <Ionicons name="location-outline" size={16} color={colors.textMuted} style={styles.resultIcon} />
                <Text style={styles.resultLabel} numberOfLines={2}>
                  {item.label}
                </Text>
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: typography.body.fontSize,
    height: "100%",
  },
  error: {
    color: colors.danger,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  results: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
    overflow: "hidden",
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  resultLabel: {
    flex: 1,
    color: colors.text,
    fontSize: typography.body.fontSize,
  },
});
