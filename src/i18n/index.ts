/**
 * i18n Configuration
 * Initializes i18next with language detection and React binding
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {
  SupportedLanguage,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  LANGUAGE_STORAGE_KEY,
} from './types';

// Import locale files (will be created in task 2)
import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';

// Re-export types for convenience
export * from './types';

/**
 * Check if a language code is supported
 */
export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}

/**
 * Normalize browser language to supported language
 * e.g., 'zh' -> 'zh-CN', 'en' -> 'en-US'
 */
export function normalizeLanguage(lang: string): SupportedLanguage {
  if (isSupportedLanguage(lang)) {
    return lang;
  }
  
  // Handle language without region
  const baseLang = lang.split('-')[0].toLowerCase();
  if (baseLang === 'zh') {
    return 'zh-CN';
  }
  if (baseLang === 'en') {
    return 'en-US';
  }
  
  return DEFAULT_LANGUAGE;
}


/**
 * Initialize i18next with configuration
 */
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': { translation: zhCN },
      'en-US': { translation: enUS },
    },
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    
    // Language detection options
    detection: {
      // Order of language detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Cache user language preference
      caches: ['localStorage'],
      // localStorage key
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
    },
    
    interpolation: {
      // React already escapes values
      escapeValue: false,
    },
    
    // Return key if translation is missing (for development)
    returnEmptyString: false,
    
    // React Suspense support
    react: {
      useSuspense: false,
    },
  });

/**
 * Change the current language
 * Persists to localStorage automatically via detection config
 */
export function changeLanguage(lang: SupportedLanguage): Promise<void> {
  return i18n.changeLanguage(lang).then(() => {});
}

/**
 * Get the current language
 */
export function getCurrentLanguage(): SupportedLanguage {
  return normalizeLanguage(i18n.language);
}

/**
 * Save language preference to localStorage
 */
export function saveLanguagePreference(lang: SupportedLanguage): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (e) {
    console.warn('Failed to save language preference to localStorage:', e);
  }
}

/**
 * Load language preference from localStorage
 */
export function loadLanguagePreference(): SupportedLanguage | null {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && isSupportedLanguage(stored)) {
      return stored;
    }
  } catch (e) {
    console.warn('Failed to load language preference from localStorage:', e);
  }
  return null;
}

export default i18n;
