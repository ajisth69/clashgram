import type { CapacitorConfig } from '@capacitor/cli';

const isDevelopment = process.env.APP_ENV === 'development' || process.env.CAPACITOR_WEBVIEW_DEBUG === '1';

const config: CapacitorConfig = {
  appId: 'com.clashgram.mobile',
  appName: 'Clashgram',
  webDir: 'dist',
  loggingBehavior: isDevelopment ? 'debug' : 'production',
  server: {
    androidScheme: 'https',
  },
  android: {
    webContentsDebuggingEnabled: isDevelopment,
    minWebViewVersion: 120,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_clashgram',
      iconColor: '#8774E1',
      sound: 'clashgram_notification.wav',
      presentationOptions: ['badge', 'sound', 'banner', 'list'],
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert', 'banner', 'list'],
    },
  },
};

export default config;
