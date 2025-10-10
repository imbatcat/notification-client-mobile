import { View, Text, StyleSheet } from "react-native";
import { colors, typography, spacing } from "../constants/theme";

export default function EmptyState() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🐧</Text>
      <Text style={styles.text}>I have a penguin</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xl * 2,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  text: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    fontWeight: typography.weights.regular,
  },
});
