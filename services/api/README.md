# API Client Documentation

## Overview

Centralized API client for making HTTP requests with automatic authentication.

## Configuration

Set the base URL in your `.env` file:

```
EXPO_PUBLIC_API_URL=https://your-api-url.com/api
```

## Usage

### Basic Usage

```javascript
import { apiClient, notificationApi } from "../../services/api";

// GET request with auth
const data = await apiClient.get("/v1/users");

// POST request with auth
const result = await apiClient.post("/v1/users", { name: "John" });

// GET request without auth
const publicData = await apiClient.get("/v1/public", {}, false);
```

### Notification API

```javascript
import { notificationApi } from "../../services/api";

// Get test notifications
const testData = await notificationApi.getNotifications();

// Get all notifications with pagination
const notifications = await notificationApi.getNotifications({
  page: 1,
  limit: 20,
});

// Mark notification as read
await notificationApi.markAsRead("notification-id");

// Delete notification
await notificationApi.deleteNotification("notification-id");

// Mark all as read
await notificationApi.markAllAsRead();
```

### Error Handling

```javascript
import { apiClient, ApiError } from "../../services/api";

try {
  const data = await apiClient.get("/v1/users");
  console.log("Success:", data);
} catch (error) {
  if (error instanceof ApiError) {
    console.error("API Error:", error.message);
    console.error("Status Code:", error.statusCode);
    console.error("Error Data:", error.data);
  } else {
    console.error("Network Error:", error.message);
  }
}
```

### Available Methods

#### `apiClient.get(endpoint, options, requiresAuth)`

Make a GET request

- `endpoint`: API endpoint (e.g., '/v1/users')
- `options`: Additional fetch options (optional)
- `requiresAuth`: Whether to include auth token (default: true)

#### `apiClient.post(endpoint, body, options, requiresAuth)`

Make a POST request

- `endpoint`: API endpoint
- `body`: Request body object
- `options`: Additional fetch options (optional)
- `requiresAuth`: Whether to include auth token (default: true)

#### `apiClient.put(endpoint, body, options, requiresAuth)`

Make a PUT request

#### `apiClient.patch(endpoint, body, options, requiresAuth)`

Make a PATCH request

#### `apiClient.delete(endpoint, options, requiresAuth)`

Make a DELETE request

## Features

✅ Automatic authentication headers (Bearer token)  
✅ Centralized error handling  
✅ Request/response logging  
✅ Custom API error class  
✅ Support for all HTTP methods  
✅ TypeScript-ready structure

## File Structure

```
services/api/
├── client.js         # Main API client class
├── notifications.js  # Notification-specific endpoints
├── index.js         # Exports
└── README.md        # This file
```

## Adding New API Services

Create a new file in `services/api/`:

```javascript
// services/api/users.js
import apiClient from "./client";

export const userApi = {
  async getProfile() {
    return apiClient.get("/v1/profile");
  },

  async updateProfile(data) {
    return apiClient.put("/v1/profile", data);
  },
};

export default userApi;
```

Then export it in `index.js`:

```javascript
export { default as userApi } from "./users";
```
