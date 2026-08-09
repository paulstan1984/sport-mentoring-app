import type { CapacitorConfig } from '@capacitor/cli';

// Switch APP_URL to 'http://10.0.2.2:3000' for Android emulator local dev
// (10.0.2.2 is the emulator's alias for the host machine's localhost)
const APP_URL = 'https://sport-mentoring-app.fly.dev';
//const APP_URL = 'http://10.0.2.2:3000'; // for Android emulator local dev

const config: CapacitorConfig = {
  appId: 'com.sportmentor.app',
  appName: 'Sport Mentor',
  webDir: 'www',
  server: {
    url: APP_URL,
    cleartext: true, // required for http:// (dev only)
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#f9fafb',
  },
};

export default config;
