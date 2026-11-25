import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.selfdiscipline.tracker',
  appName: '自律日记',
  webDir: 'dist',
  ios: {
    contentInset: 'never',
    scrollEnabled: false,
    preferredContentMode: 'mobile',
    backgroundColor: '#F7F8FA',
    zoomEnabled: false
  },
  plugins: {
    StatusBar: {
      style: 'LIGHT',
      overlaysWebView: true
    }
  }
};

export default config;
