import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { authUtils } from "../../utils/auth";
import { useSignalR } from "../../context/signalrContext";
import { colors, typography, spacing } from "../../constants/theme";
import { ConnectionStates } from "../../services/signalr/ConnectionStates";

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const { service: signalrService } = useSignalR();

  useEffect(() => {
    // Load user data
    const loadUser = async () => {
      const userData = await authUtils.getUser();
      setUser(userData);
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          // Disconnect SignalR
          if (signalrService.connectionStatus.state === ConnectionStates.CONNECTED) {
            signalrService.stopConnection();
          }

          // Clear auth data
          await authUtils.clear();

          // Navigate to login
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back!</Text>
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.fullName || "User"}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        )}
        <Text style={styles.subtitle}>
          Check the notifications tab to see your notifications
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  userInfo: {
    backgroundColor: "#fff",
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.xl,
    minWidth: 250,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  userName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
  logoutButton: {
    backgroundColor: "#fff",
    padding: spacing.md,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutButtonText: {
    color: "#c00",
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
});
