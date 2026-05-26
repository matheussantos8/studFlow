import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studflow.app',
  appName: 'studFlow',
  webDir: 'www',
  plugins: {
    Keyboard: {
      resize: 'body', 
      style: 'dark'  
    }
  }
};

export default config;
