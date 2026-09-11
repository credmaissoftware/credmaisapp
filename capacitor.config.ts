import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.credmais.app',
  appName: 'CredMais',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#08111d',
      showSpinner: false,
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
    },
  },
};

export default config;
