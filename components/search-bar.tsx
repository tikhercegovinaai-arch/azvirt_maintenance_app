import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}

export function SearchBar({
  placeholder,
  value,
  onChangeText,
  onClear,
}: SearchBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? "rgba(50, 52, 53, 0.9)"
            : "rgba(255, 255, 255, 0.9)",
        },
      ]}
    >
      <View style={styles.inputWrapper}>
        <ThemedText style={styles.searchIcon}>🔍</ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              color: isDark ? "#ECEDEE" : "#1a1a1a",
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={isDark ? "#9BA1A6" : "#999999"}
          value={value}
          onChangeText={onChangeText}
        />
        {value.length > 0 && (
          <Pressable onPress={onClear} style={styles.clearButton}>
            <ThemedText style={styles.clearIcon}>✕</ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 149, 0, 0.2)",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.3)",
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 0,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  clearIcon: {
    fontSize: 16,
    color: "#FF9500",
  },
});
