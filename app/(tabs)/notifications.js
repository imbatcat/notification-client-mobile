import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Modal,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useState, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import RenderHTML from "react-native-render-html";
import NotificationCard from "../../components/NotificationCard";
import EmptyState from "../../components/EmptyState";
import {
  colors,
  spacing,
  typography,
  borderRadius,
} from "../../constants/theme";
import { useNotificationStateContext } from "../../context/notificationStateContext";
import { notificationApi } from "../../services/api";

export default function NotificationsScreen() {
  const {
    notifications,
    refreshing,
    fetchNotifications,
    setNotifications,
    setPingCount,
  } = useNotificationStateContext();
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { width } = useWindowDimensions();

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
      setUnreadCount(0);
    }
  };

  // Load unread count on mount
  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // Reset ping count when screen is focused
  useFocusEffect(() => {
    setPingCount(0);
  });

  const handleNotificationPress = async (notification) => {
    console.log("Notification pressed:", notification.id);
    setSelectedNotification(notification);

    // Mark as read - update local state optimistically
    if (!notification.isRead) {
      try {
        // Update local state immediately
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
        // Update unread count
        setUnreadCount((prev) => Math.max(0, prev - 1));

        // Update on server in background
        await notificationApi.markAsRead(notification.id);
      } catch (error) {
        console.error("Failed to mark as read:", error);
        // Revert on error
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, isRead: false } : n
          )
        );
        setUnreadCount((prev) => prev + 1);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Update local state immediately
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);

      // Update on server
      await notificationApi.markAllAsRead();

      // Fetch fresh data to ensure consistency
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      // Refetch on error to restore state
      await fetchNotifications();
      await fetchUnreadCount();
    }
  };

  const handleDismiss = async (notificationId) => {
    console.log("Dismiss notification:", notificationId);
    try {
      // Update local state immediately (optimistic update)
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      // Delete on server in background
      await notificationApi.deleteNotification(notificationId);
    } catch (error) {
      console.error("Failed to delete notification:", error);
      // Refetch on error to restore state
      await fetchNotifications();
    }
  };

  const closeModal = () => {
    setSelectedNotification(null);
  };

  if (!notifications || notifications.length === 0) {
    return <EmptyState />;
  }

  return (
    <View style={styles.container}>
      {/* Unread Count Header */}
      <View style={styles.header}>
        <View style={styles.unreadSection}>
          <Text style={styles.unreadLabel}>Unread Notifications</Text>
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{unreadCount}</Text>
          </View>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.markAllButtonText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onPress={handleNotificationPress}
            onDismiss={handleDismiss}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              fetchNotifications();
              fetchUnreadCount();
            }}
            tintColor={colors.text.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Notification Detail Modal */}
      <Modal
        visible={!!selectedNotification}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notification Details</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {selectedNotification && (
                <>
                  {/* Type Badge */}
                  <View style={styles.typeBadgeContainer}>
                    <View
                      style={[
                        styles.typeBadge,
                        {
                          backgroundColor:
                            colors.notification.types[
                              selectedNotification.notificationType || "Info"
                            ]?.icon || colors.notification.types.Info.icon,
                        },
                      ]}
                    >
                      <Text style={styles.typeBadgeText}>
                        {selectedNotification.notificationType || "Info"}
                      </Text>
                    </View>
                  </View>

                  {/* Title */}
                  {selectedNotification.title && (
                    <View style={styles.section}>
                      <Text style={styles.sectionLabel}>Title</Text>
                      <Text style={styles.titleText}>
                        {selectedNotification.title}
                      </Text>
                    </View>
                  )}

                  {/* Body */}
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Message</Text>
                    {selectedNotification.body ? (
                      <RenderHTML
                        contentWidth={width - spacing.md * 4}
                        source={{ html: selectedNotification.body }}
                        baseStyle={{
                          fontSize: typography.sizes.md,
                          color: colors.text.primary,
                          lineHeight: 24,
                        }}
                        tagsStyles={{
                          body: { margin: 0, padding: 0 },
                          p: { margin: 0, marginBottom: 8 },
                          strong: { fontWeight: "bold" },
                          em: { fontStyle: "italic" },
                        }}
                      />
                    ) : (
                      <Text style={styles.bodyText}>No message</Text>
                    )}
                  </View>

                  {/* Timestamp */}
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Received</Text>
                    <Text style={styles.bodyText}>
                      {new Date(
                        selectedNotification.timestamp
                      ).toLocaleString()}
                    </Text>
                  </View>

                  {/* Additional Payload */}
                  {selectedNotification.additionalPayload && (
                    <View style={styles.section}>
                      <Text style={styles.sectionLabel}>Additional Data</Text>
                      <View style={styles.payloadContainer}>
                        <Text style={styles.payloadText}>
                          {JSON.stringify(
                            selectedNotification.additionalPayload,
                            null,
                            2
                          )}
                        </Text>
                      </View>
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={async () => {
                  if (selectedNotification) {
                    await handleDismiss(selectedNotification.id);
                    closeModal();
                  }
                }}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeFooterButton}
                onPress={closeModal}
              >
                <Text style={styles.closeFooterButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  // Header Section
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unreadSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  unreadLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.lg,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadCount: {
    color: "#FFFFFF",
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  markAllButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  markAllButtonText: {
    color: "#FFFFFF",
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.lg * 2,
    borderTopRightRadius: borderRadius.lg * 2,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeButtonText: {
    fontSize: typography.sizes.xl,
    color: colors.text.tertiary,
  },
  modalBody: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  typeBadgeContainer: {
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  typeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  typeBadgeText: {
    color: "#FFFFFF",
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  titleText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    lineHeight: 28,
  },
  bodyText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    lineHeight: 24,
  },
  payloadContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  payloadText: {
    fontFamily: "monospace",
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#FF3B30",
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  closeFooterButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeFooterButtonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});
