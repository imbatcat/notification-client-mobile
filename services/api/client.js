import { authUtils } from "../../utils/auth";

class ApiClient {
  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_API_URL;
  }

  /**
   * Make an API request
   * @param {string} endpoint - API endpoint (e.g., "/v1/users")
   * @param {object} options - Fetch options (method, headers, body, etc.)
   * @param {boolean} requiresAuth - Whether the request requires authentication
   * @returns {Promise<any>} Response data
   */
  async request(endpoint, options = {}, requiresAuth = true) {
    if (!this.baseURL) {
      throw new Error(
        "API URL not configured. Check EXPO_PUBLIC_API_URL in .env"
      );
    }

    const url = `${this.baseURL}${endpoint}`;

    // Default headers
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add authentication token if required
    if (requiresAuth) {
      const token = await authUtils.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        console.log(`✅ Token added to request: ${token.substring(0, 30)}...`);
      } else {
        console.warn("⚠️ No token found, request may fail if auth is required");
      }
    }

    // Make the request
    const config = {
      ...options,
      headers,
    };

    try {
      console.log(`API Request: ${options.method || "GET"} ${url}`);
      console.log(`Headers:`, JSON.stringify(headers, null, 2));

      const response = await fetch(url, config);

      // Log response details
      console.log(
        `API Response Status: ${response.status} ${response.statusText}`
      );
      console.log(
        `Response Headers:`,
        JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)
      );

      // Get response text first to handle non-JSON responses
      const responseText = await response.text();
      console.log(
        `Response Body (first 200 chars):`,
        responseText.substring(0, 200)
      );

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error(
          `❌ Failed to parse response as JSON. Response was:`,
          responseText.substring(0, 500)
        );
        throw new Error(
          `Server returned non-JSON response: ${responseText.substring(
            0,
            100
          )}...`
        );
      }

      if (!response.ok) {
        throw new ApiError(
          data.message || data.error || "Request failed",
          response.status,
          data
        );
      }

      console.log(`API Response: ${options.method || "GET"} ${url} - Success`);
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error(`API Error: ${options.method || "GET"} ${url}`, error);
      throw new Error(error.message || "Network request failed");
    }
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Additional fetch options
   * @param {boolean} requiresAuth - Whether the request requires authentication
   * @returns {Promise<any>}
   */
  async get(endpoint, options = {}, requiresAuth = true) {
    return this.request(endpoint, { ...options, method: "GET" }, requiresAuth);
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {object} body - Request body
   * @param {object} options - Additional fetch options
   * @param {boolean} requiresAuth - Whether the request requires authentication
   * @returns {Promise<any>}
   */
  async post(endpoint, body = null, options = {}, requiresAuth = true) {
    return this.request(
      endpoint,
      {
        ...options,
        method: "POST",
        body: body ? JSON.stringify(body) : null,
      },
      requiresAuth
    );
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {object} body - Request body
   * @param {object} options - Additional fetch options
   * @param {boolean} requiresAuth - Whether the request requires authentication
   * @returns {Promise<any>}
   */
  async put(endpoint, body = null, options = {}, requiresAuth = true) {
    return this.request(
      endpoint,
      {
        ...options,
        method: "PUT",
        body: body ? JSON.stringify(body) : null,
      },
      requiresAuth
    );
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {object} body - Request body
   * @param {object} options - Additional fetch options
   * @param {boolean} requiresAuth - Whether the request requires authentication
   * @returns {Promise<any>}
   */
  async patch(endpoint, body = null, options = {}, requiresAuth = true) {
    return this.request(
      endpoint,
      {
        ...options,
        method: "PATCH",
        body: body ? JSON.stringify(body) : null,
      },
      requiresAuth
    );
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Additional fetch options
   * @param {boolean} requiresAuth - Whether the request requires authentication
   * @returns {Promise<any>}
   */
  async delete(endpoint, options = {}, requiresAuth = true) {
    return this.request(
      endpoint,
      { ...options, method: "DELETE" },
      requiresAuth
    );
  }
}

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(message, statusCode, data) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = data;
  }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;
export { ApiError };
