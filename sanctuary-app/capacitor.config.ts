import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sanctuary.stream',
  appName: 'Sanctuary Stream',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    // Allow connections to any backend
    hostname: 'sanctuary-stream',
    androidScheme: 'https',
    iosScheme: 'https',
    // Enable CORS for all origins (user-configurable backends)
    allowNavigation: ['*']
  },
  plugins: {
    // Enable WebSocket support
    CapacitorHttp: {
      enabled: true
    },
    // Enable real-time notifications
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  },
  ios: {
    contentInset: 'always',
    // Allow all domains for user-configured backends
    scheme: 'https',
    allowsLinkPreview: false,
    // Enable background refresh for real-time updates
    backgroundColor: '#000000'
  },
  android: {
    // Allow mixed content for local PocketBase instances
    allowMixedContent: true,
    // Enable cleartext traffic for localhost
    useLegacyBridge: false,
    backgroundColor: '#000000',
    // WebView settings for better performance
    webContentsDebuggingEnabled: process.env.NODE_ENV === 'development'
  }
};

export default config;
