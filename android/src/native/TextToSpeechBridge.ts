let NativeModules: any = {};
let Platform: any = { OS: 'web' };

try {
  const rn = require('react-native');
  NativeModules = rn.NativeModules;
  Platform = rn.Platform;
} catch (e) {
  // Graceful fallback in test or web environments
}

export const TextToSpeechBridge = {
  async speak(text: string, lang = 'en', rate = 1.0): Promise<boolean> {
    if (Platform.OS === 'android' && NativeModules?.TextToSpeechModule?.speak) {
      try {
        return await NativeModules.TextToSpeechModule.speak(text, lang, rate);
      } catch (e) {
        console.warn('Native TTS speak failed:', e);
      }
    }
    // Web Speech API fallback if running on web/desktop preview
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate;
      window.speechSynthesis.speak(u);
      return true;
    }
    return true;
  },

  async stop(): Promise<boolean> {
    if (Platform.OS === 'android' && NativeModules?.TextToSpeechModule?.stop) {
      try {
        return await NativeModules.TextToSpeechModule.stop();
      } catch (e) {
        console.warn('Native TTS stop failed:', e);
      }
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    return true;
  },
};
