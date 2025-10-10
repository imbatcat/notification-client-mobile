import { View, Text, StyleSheet } from "react-native";
import { colors, typography } from "../constants/theme";

export default function NotificationBadge({ count }) {
  if (!count || count === 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.badge.background,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: colors.badge.text,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
});
