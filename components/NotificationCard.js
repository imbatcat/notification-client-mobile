import RenderHTML from "react-native-render-html";
import { useWindowDimensions } from "react-native";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, typography, spacing, borderRadius } from "../constants/theme";
import { useMemo } from "react";

export default function NotificationCard({ notification, onPress, onDismiss }) {
  const isUnread = !notification.isRead;
  const notificationType = notification.notificationType || "Info";
  const typeColors =
    colors.notification.types[notificationType] ||
    colors.notification.types.Info;
  const { width } = useWindowDimensions();
  const contentWidth =
    width - spacing.md * 2 - 32 - spacing.sm - spacing.xs - spacing.sm;

  // Custom renderers for bold tags
  const customRenderers = useMemo(
    () => ({
      strong: ({ TDefaultRenderer, ...props }) => (
        <Text style={{ fontWeight: "bold" }}>
          <TDefaultRenderer {...props} />
        </Text>
      ),
      b: ({ TDefaultRenderer, ...props }) => (
        <Text style={{ fontWeight: "bold" }}>
          <TDefaultRenderer {...props} />
        </Text>
      ),
    }),
    []
  );

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isUnread && styles.cardUnread,
        {
          borderColor: typeColors.border,
          backgroundColor: isUnread
            ? typeColors.background
            : colors.notification.read,
        },
      ]}
      onPress={() => {
        if (onPress) {
          onPress(notification);
        }
      }}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Type indicator badge */}
        <View style={[styles.typeBadge, { backgroundColor: typeColors.icon }]}>
          <Text style={styles.typeText}>{getTypeIcon(notificationType)}</Text>
        </View>

        <View style={styles.textContainer}>
          {/* Notification title */}
          {notification.title && (
            <View style={styles.titleRow}>
              {isUnread && (
                <View
                  style={[
                    styles.unreadDot,
                    { backgroundColor: typeColors.border },
                  ]}
                />
              )}
              <Text
                style={[styles.title, isUnread && styles.titleUnread]}
                numberOfLines={1}
              >
                {notification.title}
              </Text>
            </View>
          )}

          {/* Actual notification body */}
          {notification.body ? (
            <View
              style={{
                maxHeight: 44,
                overflow: "hidden",
                marginBottom: spacing.xs,
              }}
            >
              <RenderHTML
                contentWidth={contentWidth > 0 ? contentWidth : 300}
                source={{ html: notification.body }}
                baseStyle={{
                  fontSize: typography.sizes.sm,
                  color: colors.text.primary,
                  lineHeight: 20,
                }}
                tagsStyles={{
                  body: {
                    margin: 0,
                    padding: 0,
                    color: colors.text.primary,
                    fontSize: typography.sizes.sm,

                    fontWeight: isUnread
                      ? typography.weights.medium
                      : typography.weights.regular,
                  },
                  p: {
                    margin: 0,
                    marginBottom: 4,
                    color: colors.text.primary,
                    fontSize: typography.sizes.sm,
                  },
                  div: {
                    margin: 0,
                    color: colors.text.primary,
                    fontSize: typography.sizes.sm,
                  },
                  span: {
                    color: colors.text.primary,
                    fontSize: typography.sizes.sm,
                  },
                  strong: {
                    fontWeight: "bold",
                    color: colors.text.secondary,
                  },
                  b: {
                    fontWeight: "bold",
                    color: colors.text.secondary,
                  },
                  em: {
                    fontStyle: "italic",
                    color: colors.text.primary,
                  },
                  i: {
                    fontStyle: "italic",
                    color: colors.text.primary,
                  },
                  u: {
                    textDecorationLine: "underline",
                    color: colors.text.primary,
                  },
                  a: {
                    color: colors.primary,
                    textDecorationLine: "underline",
                  },
                  br: {
                    height: 0,
                  },
                }}
                defaultTextProps={{
                  style: {
                    color: colors.text.primary,
                    fontSize: typography.sizes.sm,
                  },
                }}
              />
            </View>
          ) : (
            <Text
              style={{
                fontSize: typography.sizes.sm,
                color: colors.text.primary,
                fontWeight: isUnread
                  ? typography.weights.medium
                  : typography.weights.regular,
                marginBottom: spacing.xs,
              }}
              numberOfLines={2}
            >
              No content
            </Text>
          )}

          {/* Timestamp */}
          <Text style={styles.timestamp}>
            {formatRelativeTime(notification.timestamp)}
          </Text>
        </View>

        {/* Dismiss button */}
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={(e) => {
            e.stopPropagation();
            if (onDismiss) {
              onDismiss(notification.id);
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// Get icon for notification type
function getTypeIcon(type) {
  switch (type) {
    case "Info":
      return "ℹ";
    case "Warning":
      return "⚠";
    case "Error":
      return "✕";
    default:
      return "ℹ";
  }
}

// Helper function to format relative time
function formatRelativeTime(timestamp) {
  // Handle both string ISO dates and numeric timestamps
  const date =
    typeof timestamp === "number" ? new Date(timestamp) : new Date(timestamp);

  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.notification.read,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: "hidden",
  },
  cardUnread: {
    borderWidth: 2,
  },
  content: {
    flexDirection: "row",
    padding: spacing.md,
    alignItems: "flex-start",
  },
  typeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  typeText: {
    color: "#FFFFFF",
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    flex: 1,
  },
  titleUnread: {
    fontWeight: typography.weights.bold,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  timestamp: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.regular,
  },
  dismissButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  dismissText: {
    fontSize: typography.sizes.lg,
    color: colors.text.tertiary,
    fontWeight: typography.weights.regular,
  },
});
