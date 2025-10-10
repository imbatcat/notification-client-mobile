import AsyncStorage from "@react-native-async-storage/async-storage";

export const AUTH_TOKEN_KEY = "accessToken";
export const USER_KEY = "user";

export const authUtils = {
  // Get access token
  async getToken() {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  },

  // Save access token
  async setToken(token) {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      return true;
    } catch (error) {
      console.error("Error saving token:", error);
      return false;
    }
  },

  // Get user data
  async getUser() {
    try {
      const userJson = await AsyncStorage.getItem(USER_KEY);
      console.log("userJson", userJson);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  },

  // Save user data
  async setUser(user) {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      return true;
    } catch (error) {
      console.error("Error saving user:", error);
      return false;
    }
  },

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const token = await this.getToken();
      return !!token;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  },

  // Clear all auth data
  async clear() {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_KEY]);
      return true;
    } catch (error) {
      console.error("Error clearing auth:", error);
      return false;
    }
  },

  // Login API call
  async login(identifier, password) {
    console.log("identifier", identifier);
    console.log("password", password);
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;

    if (!apiUrl) {
      throw new Error("API URL not configured");
    }

    const response = await fetch(`${apiUrl}/v1/identities/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier,
        password,
      }),
    });

    console.log("identifier", identifier);
    console.log("password", password);
    const data = await response.json();
    console.log("response", data);

    if (!response.ok) {
      throw new Error(data.message || data.error || "Login failed");
    }

    // Save token and user
    await this.setToken(data.data.accessToken);

    const user = {
      id: data.data.id,
      fullName: data.data.fullName,
      phone: data.data.phone,
      email: data.data.email,
      avatarUrl: data.data.avatarUrl,
    };

    await this.setUser(user);

    return { token: data.data.accessToken, user };
  },
};
