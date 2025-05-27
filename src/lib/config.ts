/**
 * Application-wide configuration constants
 */

export const APP_CONFIG = {
  // Main Feed Configuration
  MAIN_FEED: {
    DEFAULT_AUTHOR: "skatehacker",
    DEFAULT_PERMLINK: "test-advance-mode-post",
    INITIAL_VISIBLE_POSTS: 6,
    POSTS_INCREMENT: 6,
    SCROLL_THRESHOLD: 100,
    DOWNVOTE_THRESHOLD: 2,
  },

  // UI Configuration
  UI: {
    CONTAINER_MAX_WIDTH: "540px",
    BORDER_COLOR: "rgb(255,255,255,0.2)",
    SUCCESS_COLOR: "#9AE6B4",
    ERROR_COLOR: "#FC8181",
    WARNING_COLOR: "#F6E05E",
    INFO_COLOR: "#63B3ED",
  },

  // Animation Configuration
  ANIMATION: {
    TOAST_DURATION: 3000,
    LOADING_DEBOUNCE: 300,
    SCROLL_DEBOUNCE: 100,
  },

  // Content Validation
  VALIDATION: {
    MIN_CONTENT_LENGTH: 10,
    MAX_CONTENT_LENGTH: 10000,
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 16,
  },

  // API Configuration
  API: {
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    REQUEST_TIMEOUT: 30000,
  },

  // Storage Keys
  STORAGE_KEYS: {
    LOGIN_METHOD: "LoginMethod",
    USER_PREFERENCES: "UserPreferences",
    THEME_MODE: "ThemeMode",
  },
} as const;

/**
 * Environment-based configuration
 */
export const getEnvConfig = () => ({
  WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL || "",
  HIVE_COMMUNITY_TAG: process.env.NEXT_PUBLIC_HIVE_COMMUNITY_TAG || "",
  MAINFEED_AUTHOR: process.env.NEXT_PUBLIC_MAINFEED_AUTHOR || APP_CONFIG.MAIN_FEED.DEFAULT_AUTHOR,
  MAINFEED_PERMLINK: process.env.NEXT_PUBLIC_MAINFEED_PERMLINK || APP_CONFIG.MAIN_FEED.DEFAULT_PERMLINK,
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
});

/**
 * Feature flags for conditional functionality
 */
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: false,
  ENABLE_PWA: true,
  ENABLE_DARK_MODE: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: false,
} as const;
