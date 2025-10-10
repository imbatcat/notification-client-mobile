import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { authUtils } from "../utils/auth";
import { colors, typography, spacing } from "../constants/theme";
import { useSignalR } from "../context/signalrContext";
import { notificationApi } from "../services/api";

export default function LoginScreen() {
  const { service: signalrService } = useSignalR();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!identifier.trim()) {
      errors.identifier = "Email or username is required";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const registerPushToken = async () => {
    try {
      // Check current permission status
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // If not granted, request permissions
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === "granted") {
        console.log("✅ Notification permissions granted");

        // Get device push token
        const pushSubscription = await Notifications.getDevicePushTokenAsync();
        console.log("pushSubscription", pushSubscription);
        const token = pushSubscription.data;
        const platform = Platform.OS;

        // Register with backend
        await notificationApi.registerDeviceToken({
          deviceToken: token,
          platform,
        });
        console.log("✅ Device token registered successfully");
      } else {
        console.warn("⚠️ Notification permissions denied");
      }
    } catch (error) {
      console.error("❌ Error registering push token:", error);
      // Don't fail login if push token registration fails
    }
  };

  const handleLogin = async () => {
    // Clear previous errors
    setError(null);
    setValidationErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Attempt login
      await authUtils.login(identifier.trim(), password);

      // Register push token after successful login
      await registerPushToken();

      router.replace("/(tabs)");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          {/* Identifier Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email or Username</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.identifier && styles.inputError,
              ]}
              placeholder="Enter your email or username"
              placeholderTextColor={colors.text.tertiary}
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                if (validationErrors.identifier) {
                  setValidationErrors((prev) => ({
                    ...prev,
                    identifier: null,
                  }));
                }
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!isLoading}
            />
            {validationErrors.identifier && (
              <Text style={styles.validationError}>
                {validationErrors.identifier}
              </Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[
                styles.input,
                validationErrors.password && styles.inputError,
              ]}
              placeholder="Enter your password"
              placeholderTextColor={colors.text.tertiary}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (validationErrors.password) {
                  setValidationErrors((prev) => ({ ...prev, password: null }));
                }
              }}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            {validationErrors.password && (
              <Text style={styles.validationError}>
                {validationErrors.password}
              </Text>
            )}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{" "}
            <Text style={styles.link}>Contact support</Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: "center",
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  errorContainer: {
    backgroundColor: "#fee",
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: "#c00",
  },
  errorText: {
    color: "#c00",
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  form: {
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  inputError: {
    borderColor: "#c00",
  },
  validationError: {
    color: "#c00",
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: "center",
    marginTop: spacing.md,
    minHeight: 48,
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  link: {
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
});
