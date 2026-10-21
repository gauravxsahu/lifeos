export interface Translations {
  appName: string;
  tagline: string;
  nav: {
    dashboard: string;
    goals: string;
    apps: string;
    stories: string;
    focus: string;
    settings: string;
    logout: string;
    signIn: string;
    signUp: string;
  };
  dashboard: {
    greeting: string;
    todayUsage: string;
    goalsCompleted: string;
    focusTime: string;
    rescueTitle: string;
    rescueDesc: string;
    startFocusBtn: string;
    viewGoalsBtn: string;
    topStory: string;
    weeklyTrend: string;
  };
  goals: {
    title: string;
    subtitle: string;
    addGoal: string;
    target: string;
    priority: string;
    complete: string;
    completed: string;
    pending: string;
    empty: string;
  };
  apps: {
    title: string;
    subtitle: string;
    addApp: string;
    dailyLimit: string;
    thresholds: string;
    mode: string;
    voiceReminder: string;
    empty: string;
  };
  stories: {
    title: string;
    subtitle: string;
    verifiedFact: string;
    listen: string;
    stopAudio: string;
    viewSource: string;
    save: string;
    saved: string;
  };
  focus: {
    title: string;
    subtitle: string;
    start: string;
    pause: string;
    resume: string;
    finish: string;
    sessionFinished: string;
    verifyGoal: string;
  };
  settings: {
    title: string;
    language: string;
    voiceAssistant: string;
    soundReminder: string;
    quietHours: string;
    privacy: string;
    exportData: string;
    deleteUsage: string;
    deleteAccount: string;
  };
}

export const translations: Record<string, Translations> = {
  en: {
    appName: 'LIFEOS',
    tagline: 'Less Scrolling. More Living.',
    nav: {
      dashboard: 'Dashboard',
      goals: 'Daily Goals',
      apps: 'App Timers',
      stories: 'Stories',
      focus: 'Focus Session',
      settings: 'Settings',
      logout: 'Logout',
      signIn: 'Sign In',
      signUp: 'Get Started',
    },
    dashboard: {
      greeting: 'Welcome back',
      todayUsage: "Today's App Usage",
      goalsCompleted: 'Goals Completed',
      focusTime: 'Focus Time',
      rescueTitle: 'Daily Goal Rescue',
      rescueDesc: 'Notice yourself scrolling? Take a small 20-minute action on your goals.',
      startFocusBtn: 'Start Focus Block',
      viewGoalsBtn: 'View Goals',
      topStory: 'Verified Motivation of the Day',
      weeklyTrend: 'Weekly Screen Time vs Focus',
    },
    goals: {
      title: 'Daily Goals',
      subtitle: 'Define measurable daily targets. Build lasting real-world habits.',
      addGoal: 'Create Daily Goal',
      target: 'Target',
      priority: 'Priority',
      complete: 'Mark Done',
      completed: 'Completed',
      pending: 'In Progress',
      empty: 'No goals yet. Add one to give your day intentional direction.',
    },
    apps: {
      title: 'App Timers & Limits',
      subtitle: 'Set custom thresholds for distracting apps. Intervene with kindness.',
      addApp: 'Monitor New App',
      dailyLimit: 'Daily Limit',
      thresholds: 'Reminder Thresholds',
      mode: 'Delivery Mode',
      voiceReminder: 'Voice Playback',
      empty: 'No applications monitored yet. Connect an app to start digital mindfulness.',
    },
    stories: {
      title: 'Verified Motivational Stories',
      subtitle: 'Historical, verified milestones from real pioneers. Grounded in facts, not fiction.',
      verifiedFact: 'Fact-Checked & Sourced',
      listen: 'Listen to Story',
      stopAudio: 'Stop Audio',
      viewSource: 'View Historical Sources',
      save: 'Bookmark',
      saved: 'Saved in Library',
    },
    focus: {
      title: 'Focus Sessions',
      subtitle: 'Singular, uninterrupted blocks of deep work. Free from attention residue.',
      start: 'Begin Focus Session',
      pause: 'Pause Timer',
      resume: 'Resume Timer',
      finish: 'Complete Session',
      sessionFinished: 'Well done! 🎉 You finished your focus session.',
      verifyGoal: 'Did you make progress or complete your goal during this session?',
    },
    settings: {
      title: 'Settings & Privacy',
      language: 'Language & Locale',
      voiceAssistant: 'Voice Assistant & Speech',
      soundReminder: '5-Second Reminder Sound',
      quietHours: 'Quiet Hours (Do Not Disturb)',
      privacy: 'Data Ownership & Privacy Rights',
      exportData: 'Export All Data (JSON)',
      deleteUsage: 'Purge Usage Records',
      deleteAccount: 'Permanently Delete Account',
    },
  },

  hi: {
    appName: 'LIFEOS',
    tagline: 'कम स्क्रॉलिंग। सार्थक जीवन।',
    nav: {
      dashboard: 'डैशबोर्ड',
      goals: 'दैनिक लक्ष्य',
      apps: 'ऐप टाइमर',
      stories: 'प्रेरणादायक कहानियाँ',
      focus: 'फोकस सत्र',
      settings: 'सेटिंग्स',
      logout: 'लॉगआउट',
      signIn: 'साइन इन',
      signUp: 'शुरू करें',
    },
    dashboard: {
      greeting: 'नमस्ते',
      todayUsage: 'आज का ऐप उपयोग',
      goalsCompleted: 'पूर्ण लक्ष्य',
      focusTime: 'फोकस समय',
      rescueTitle: 'दैनिक लक्ष्य बचाव (Goal Rescue)',
      rescueDesc: 'स्क्रॉल करते हुए समय निकल गया? अपने लक्ष्य की ओर केवल 20 मिनट का एक छोटा कदम बढ़ाएं।',
      startFocusBtn: 'फोकस सत्र शुरू करें',
      viewGoalsBtn: 'लक्ष्य देखें',
      topStory: 'आज की सत्यापित प्रेरणा',
      weeklyTrend: 'साप्ताहिक स्क्रीन समय बनाम फोकस',
    },
    goals: {
      title: 'दैनिक लक्ष्य',
      subtitle: 'मापने योग्य दैनिक लक्ष्य निर्धारित करें और वास्तविक प्रगति बनाएं।',
      addGoal: 'नया लक्ष्य जोड़ें',
      target: 'लक्ष्य सीमा',
      priority: 'प्राथमिकता',
      complete: 'पूर्ण चिह्नित करें',
      completed: 'पूर्ण हुआ',
      pending: 'प्रगति में',
      empty: 'अभी कोई लक्ष्य नहीं है। अपने दिन को सार्थक दिशा देने के लिए एक लक्ष्य जोड़ें।',
    },
    apps: {
      title: 'ऐप टाइमर और सीमाएं',
      subtitle: 'ध्यान भटकाने वाले ऐप्स के लिए समय सीमा निर्धारित करें।',
      addApp: 'नया ऐप मॉनिटर करें',
      dailyLimit: 'दैनिक सीमा',
      thresholds: 'रिमाइंडर सीमाएं',
      mode: 'डिलीवरी मोड',
      voiceReminder: 'वॉयस प्लेबैक',
      empty: 'अभी कोई ऐप मॉनिटर नहीं किया जा रहा है।',
    },
    stories: {
      title: 'सत्यापित प्रेरक कहानियाँ',
      subtitle: 'सच्चे ऐतिहासिक तथ्यों और प्रमाणों पर आधारित प्रेरणा।',
      verifiedFact: 'प्रमाणित एवं स्रोत सहित',
      listen: 'कहानी सुनें',
      stopAudio: 'आवाज रोकें',
      viewSource: 'ऐतिहासिक स्रोत देखें',
      save: 'बुकमार्क करें',
      saved: 'लाइब्रेरी में सहेजा गया',
    },
    focus: {
      title: 'फोकस सत्र',
      subtitle: 'बिना किसी व्यवधान के गहन कार्य का सत्र।',
      start: 'सत्र शुरू करें',
      pause: 'रोकें',
      resume: 'पुनः आरंभ करें',
      finish: 'सत्र समाप्त करें',
      sessionFinished: 'शानदार कार्य! 🎉 आपने अपना फोकस सत्र पूरा किया।',
      verifyGoal: 'क्या आपने इस सत्र के दौरान अपने लक्ष्य पर प्रगति की?',
    },
    settings: {
      title: 'सेटिंग्स और गोपनीयता',
      language: 'भाषा चयन',
      voiceAssistant: 'वॉयस असिस्टेंट',
      soundReminder: '5-सेकंड रिमाइंडर ध्वनि',
      quietHours: 'शांत समय (Quiet Hours)',
      privacy: 'डेटा और गोपनीयता अधिकार',
      exportData: 'सभी डेटा डाउनलोड करें',
      deleteUsage: 'उपयोग डेटा हटाएं',
      deleteAccount: 'खाता स्थायी रूप से हटाएं',
    },
  },

  hinglish: {
    appName: 'LIFEOS',
    tagline: 'Less Scrolling. More Living.',
    nav: {
      dashboard: 'Dashboard',
      goals: 'Daily Goals',
      apps: 'App Timers',
      stories: 'Stories',
      focus: 'Focus Session',
      settings: 'Settings',
      logout: 'Logout',
      signIn: 'Sign In',
      signUp: 'Start Karo',
    },
    dashboard: {
      greeting: 'Welcome dost',
      todayUsage: 'Aaj ka App Usage',
      goalsCompleted: 'Goals Completed',
      focusTime: 'Focus Time',
      rescueTitle: 'Daily Goal Rescue',
      rescueDesc: 'Scrolling mein time nikal gaya? Tension mat lo, bas 20 minutes apne goal ko do!',
      startFocusBtn: 'Focus Session Shuru Karo',
      viewGoalsBtn: 'Goals Dekho',
      topStory: 'Verified Motivation of the Day',
      weeklyTrend: 'Weekly Screen Time vs Focus',
    },
    goals: {
      title: 'Daily Goals',
      subtitle: 'Roz ke measurable targets set karo aur meaningful progress pao.',
      addGoal: 'Naya Goal Banayein',
      target: 'Target',
      priority: 'Priority',
      complete: 'Complete Mark Karein',
      completed: 'Completed',
      pending: 'In Progress',
      empty: 'Abhi koi goal nahi hai. Apna pehla goal add karein.',
    },
    apps: {
      title: 'App Timers & Limits',
      subtitle: 'Distracting apps par limits lagao aur respectful reminders pao.',
      addApp: 'Monitor App',
      dailyLimit: 'Daily Limit',
      thresholds: 'Reminder Thresholds',
      mode: 'Delivery Mode',
      voiceReminder: 'Voice Playback',
      empty: 'Koi app monitor nahi ho raha hai.',
    },
    stories: {
      title: 'Verified Motivational Stories',
      subtitle: 'Real pioneers ki verified success stories. No fake quotes.',
      verifiedFact: 'Fact-Checked & Sourced',
      listen: 'Kahani Suno',
      stopAudio: 'Audio Roko',
      viewSource: 'Sources Dekho',
      save: 'Save Karein',
      saved: 'Saved in Library',
    },
    focus: {
      title: 'Focus Sessions',
      subtitle: 'Deep work block without distractions. Phone side mein rakho!',
      start: 'Focus Shuru Karo',
      pause: 'Pause Karo',
      resume: 'Resume Karo',
      finish: 'Complete Session',
      sessionFinished: 'Bohat badiya! 🎉 Session complete ho gaya.',
      verifyGoal: 'Kya aapne is session mein apna goal solve kiya?',
    },
    settings: {
      title: 'Settings & Privacy',
      language: 'Language Selection',
      voiceAssistant: 'Voice Companion',
      soundReminder: '5-Second Reminder Sound',
      quietHours: 'Quiet Hours',
      privacy: 'Privacy & Data Rights',
      exportData: 'Export All Data',
      deleteUsage: 'Purge Usage Records',
      deleteAccount: 'Delete Account',
    },
  },
};

// Return translations for supported language or fallback to English
export function getTranslations(lang: string): Translations {
  return translations[lang] || translations.en;
}
