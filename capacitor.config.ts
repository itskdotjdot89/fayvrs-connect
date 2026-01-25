import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.DflPruUvMpIu.Fayvrs',
  appName: 'Fayvrs',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic'
  },
  android: {
    backgroundColor: '#ffffff'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
