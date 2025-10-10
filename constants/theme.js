// Minimalist theme constants
export const colors = {
  primary: "#2196F3",
  background: "#FFFFFF",
  surface: "#F5F5F5",
  border: "#E0E0E0",

  text: {
    primary: "#000000",
    secondary: "#666666",
    tertiary: "#999999",
  },

  notification: {
    unread: "#F0F8FF",
    read: "#FFFFFF",
    unreadIndicator: "#2196F3",
    types: {
      Info: {
        border: "#2196F3",
        background: "#E3F2FD",
        icon: "#1976D2",
      },
      Warning: {
        border: "#FF9800",
        background: "#FFF3E0",
        icon: "#F57C00",
      },
      Error: {
        border: "#F44336",
        background: "#FFEBEE",
        icon: "#D32F2F",
      },
    },
  },

  badge: {
    background: "#FF3B30",
    text: "#FFFFFF",
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  weights: {
    regular: "400",
    medium: "500",
    bold: "700",
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
};
