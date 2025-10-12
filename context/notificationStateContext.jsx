import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { notificationApi } from "../services/api";
import { useSignalR } from "./signalrContext";
import {
  CLIENT_METHODS,
  HUB_METHODS,
} from "../services/signalr/signalingMethods";
import registerHandlers from "../services/signalr/handlers/registerMainHandlers";
import unregisterHandlers from "../services/signalr/handlers/unregisterMainHandlers";
import { ConnectionStates } from "../services/signalr/ConnectionStates";
import { LIFECYCLE_METHODS } from "../services/signalr/lifecycleMethods";
import { authUtils } from "../utils/auth";

const NotificationStateContext = createContext();

export const useNotificationStateContext = () => {
  const context = useContext(NotificationStateContext);
  if (!context) {
    throw new Error(
      "useNotificationStateContext must be used within a NotificationStateProvider"
    );
  }
  return context;
};

export const NotificationStateProvider = ({ children }) => {
  const [pingCount, setPingCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { service: signalrService } = useSignalR();

  const handleOnReconnecting = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    console.log("notificationStateProvider");
    if (!authUtils.isAuthenticated()) {
      return;
    }
    if (signalrService.connectionStatus.state === ConnectionStates.CONNECTED) {
      console.log("SignalR: Connection already connected");
      registerHandlers(
        signalrService.connection,
        signalrService.boundTriggerCallback
      );
      fetchNotifications();
    } else {
      signalrService.onEvent(LIFECYCLE_METHODS.ON_CONNECTED, () => {
        console.log("SignalR: Connection connected");
        registerHandlers(
          signalrService.connection,
          signalrService.boundTriggerCallback
        );
        fetchNotifications();
      });
    }

    signalrService.onEvent(LIFECYCLE_METHODS.ON_RECONNECTING, handleOnReconnecting);

    signalrService.onEvent(CLIENT_METHODS.NOTIFICATION_RECEIVED, () => {
      console.log("Received notification: received");
      setPingCount((prev) => prev + 1);
      signalrService.invokeHubMethod(HUB_METHODS.CONFIRM_HANDSHAKE);
      fetchNotifications();
    });
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setRefreshing(true);

      const response = await notificationApi.getNotifications();
      console.log("Refreshed notifications:", response);

      const notifications = response.data.items;

      notifications.sort((a, b) => b.timestamp - a.timestamp);

      if (response.data && response.data.items) {
        setNotifications(notifications);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <NotificationStateContext.Provider
      value={useMemo(
        () => ({
          notifications,
          loadingNotifications,
          refreshing,
          pingCount,
          setNotifications,
          setLoadingNotifications,
          setRefreshing,
          setPingCount,
          fetchNotifications,
        }),
        [notifications, loadingNotifications, refreshing, pingCount]
      )}
    >
      {children}
    </NotificationStateContext.Provider>
  );
};
