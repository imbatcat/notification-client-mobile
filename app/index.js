import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { authUtils } from "../utils/auth";
import { colors } from "../constants/theme";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication and redirect
    const checkAuth = async () => {
      try {
        // Small delay to ensure router is ready
        await new Promise((resolve) => setTimeout(resolve, 100));

        const isAuthenticated = await authUtils.isAuthenticated();

        if (isAuthenticated) {
          router.replace("/(tabs)");
        } else {
          // Redirect to login
          router.replace("/login");
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        // On error, redirect to login to be safe
        router.replace("/login");
      }
    };

    checkAuth();
  }, []);

  // Show loading while checking auth
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
});
