import React, { createContext, useContext, useState, useEffect } from 'react';
import { Translations, getTranslations } from '../i18n/translations';
import { api } from '../services/api';

interface LanguageContextType {
  language: string;
  t: Translations;
  setLanguage: (lang: string) => Promise<void>;
  supportedLanguages: Array<{ code: string; label: string; native: string }>;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'hinglish', label: 'Hinglish', native: 'Hinglish' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
];

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLangState] = useState<string>(() => {
    return localStorage.getItem('lifeos_lang') || 'en';
  });

  const t = getTranslations(language);

  const setLanguage = async (newLang: string) => {
    setLangState(newLang);
    localStorage.setItem('lifeos_lang', newLang);
    try {
      if (localStorage.getItem('lifeos_token')) {
        await api.updateLanguage(newLang);
      }
    } catch (e) {
      // Local preference still preserved
    }
  };

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
