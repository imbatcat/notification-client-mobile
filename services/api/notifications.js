import apiClient from "./client";

/**
 * Notification API service
 */
export const notificationApi = {
  /**
   * Get paginated notifications for the authenticated user
   * @param {object} params - Query parameters for filtering and pagination
   * @param {number} params.Page - The page number to retrieve (default: 1)
   * @param {number} params.Size - The number of items per page (default: 10, max: 20)
   * @param {boolean} params.DoApplyPaging - Whether to apply pagination (default: true)
   * @returns {Promise<any>} Paginated list of notifications
   */
  async getNotifications(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString
        ? `/v1/notifications?${queryString}`
        : "/v1/notifications";

      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  /**
   * Get the count of unread notifications for the authenticated user
   * @returns {Promise<number>} The number of unread notifications
   */
  async getUnreadCount() {
    try {
      const response = await apiClient.get("/v1/notifications/unread-count");
      return response;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      throw error;
    }
  },

  /**
   * Mark a specific notification as read
   * @param {string} notificationId - The unique identifier of the notification
   * @returns {Promise<any>}
   */
  async markAsRead(notificationId) {
    try {
      const response = await apiClient.put(
        `/v1/notifications/${notificationId}/read`
      );
      return response;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  /**
   * Mark all notifications for the authenticated user as read
   * @returns {Promise<any>}
   */
  async markAllAsRead() {
    try {
      const response = await apiClient.put("/v1/notifications/read-all");
      return response;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },

  /**
   * Delete a specific notification
   * @param {string} notificationId - The unique identifier of the notification to delete
   * @returns {Promise<any>}
   */
  async deleteNotification(notificationId) {
    try {
      const response = await apiClient.delete(
        `/v1/notifications/${notificationId}`
      );
      return response;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },

  /**
   * Register a device token for push notifications
   * @param {object} command - Device token registration data
   * @param {string} command.deviceToken - Firebase Cloud Messaging (FCM) device token
   * @param {string} command.platform - Device platform (e.g., 'ios', 'android')
   * @returns {Promise<any>}
   */
  async registerDeviceToken(command) {
    try {
      const response = await apiClient.post(
        "/v1/notifications/device-token",
        command
      );
      return response;
    } catch (error) {
      console.error("Error registering device token:", error);
      throw error;
    }
  },
};

export default notificationApi;
