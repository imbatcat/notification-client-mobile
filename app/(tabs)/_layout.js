import { Tabs } from "expo-router";
import { colors, typography } from "../../constants/theme";
import { useEffect, useState, useRef } from "react";
import { useSignalR } from "../../context/signalrContext";
import { useNotificationStateContext } from "../../context/notificationStateContext";
import { ConnectionStates } from "../../services/signalr/ConnectionStates";
import { LIFECYCLE_METHODS } from "../../services/signalr/lifecycleMethods";
import { BellIcon } from "../../components/BellIcon";

export default function TabsLayout() {
  const { service: signalrService } = useSignalR();
  const { pingCount } = useNotificationStateContext();
  const [animateBell, setAnimateBell] = useState(false);
  const previousPingCount = useRef(pingCount);

  useEffect(() => {
    signalrService.startConnection();
  }, []);

  // Trigger animation when pingCount increases
  useEffect(() => {
    if (pingCount > previousPingCount.current) {
      setAnimateBell(true);
      setTimeout(() => setAnimateBell(false), 500);
    }
    previousPingCount.current = pingCount;
  }, [pingCount]);
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: typography.sizes.xs,
          fontWeight: typography.weights.medium,
        },
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          fontSize: typography.sizes.lg,
          fontWeight: typography.weights.bold,
          color: colors.text.primary,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => null, // You can add icons later
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarLabel: "Notifications",
          tabBarIcon: ({ color }) => (
            <BellIcon
              color={color}
              badgeCount={pingCount}
              animate={animateBell}
            />
          ),
        }}
      />
    </Tabs>
  );
}
