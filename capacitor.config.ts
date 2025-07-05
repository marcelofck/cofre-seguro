import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.62bd130a6c6b4d4d9f5fc4560aba92dc',
  appName: 'senha-segura-guardiao',
  webDir: 'dist',
  server: {
    url: 'https://62bd130a-6c6b-4d4d-9f5f-c4560aba92dc.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
    },
  },
};

export default config;